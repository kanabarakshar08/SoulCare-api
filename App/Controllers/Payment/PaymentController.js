import Stripe from 'stripe';
import Appointment from '../../Models/Appointment.js';
import Therapy from '../../Models/Therapy.js';
import User from '../../Models/User.js';
import Response from '../../utils/response.js';
import { ROLES } from '../../utils/Enum.js';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class PaymentController {
    // Create payment intent for appointment
    createPaymentIntent = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { appointment_id } = req.body;
            const userId = req.userId;

            // Get appointment details
            const appointment = await Appointment.findById(appointment_id)
                .populate('therapy_id', 'title price currency')
                .populate('doctor_id', 'first_name last_name');

            if (!appointment) {
                return response.sendError({
                    statusCode: 404,
                    message: 'Appointment not found'
                });
            }

            // Check if user is the patient for this appointment
            if (appointment.patient_id.toString() !== userId) {
                return response.sendError({
                    statusCode: 403,
                    message: 'You can only pay for your own appointments'
                });
            }

            // Check if appointment is already paid
            if (appointment.payment_status === 'paid') {
                return response.sendError({
                    statusCode: 400,
                    message: 'Appointment is already paid'
                });
            }

            // Convert price to cents (Stripe uses cents)
            const amountInCents = Math.round(appointment.price * 100);

            // Create payment intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: appointment.currency.toLowerCase(),
                metadata: {
                    appointment_id: appointment._id.toString(),
                    patient_id: userId,
                    doctor_id: appointment.doctor_id._id.toString(),
                    therapy_title: appointment.therapy_id.title
                },
                description: `Payment for therapy session: ${appointment.therapy_id.title}`,
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            // Update appointment with payment intent ID
            appointment.payment_id = paymentIntent.id;
            appointment.payment_method = 'stripe';
            await appointment.save();

            return response.sendSuccess({
                message: 'Payment intent created successfully',
                data: {
                    client_secret: paymentIntent.client_secret,
                    payment_intent_id: paymentIntent.id,
                    amount: appointment.price,
                    currency: appointment.currency,
                    appointment_id: appointment._id
                }
            });

        } catch (error) {
            console.error('Error creating payment intent:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to create payment intent',
                error: error.message
            });
        }
    };

    // Confirm payment
    confirmPayment = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { payment_intent_id } = req.body;

            // Retrieve payment intent from Stripe
            const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

            if (paymentIntent.status === 'succeeded') {
                // Update appointment payment status
                const appointment = await Appointment.findOne({ payment_id: payment_intent_id });
                
                if (appointment) {
                    appointment.payment_status = 'paid';
                    appointment.status = 'confirmed';
                    await appointment.save();

                    return response.sendSuccess({
                        message: 'Payment confirmed successfully',
                        data: {
                            appointment_id: appointment._id,
                            payment_status: appointment.payment_status,
                            status: appointment.status
                        }
                    });
                } else {
                    return response.sendError({
                        statusCode: 404,
                        message: 'Appointment not found for this payment'
                    });
                }
            } else {
                return response.sendError({
                    statusCode: 400,
                    message: `Payment not completed. Status: ${paymentIntent.status}`
                });
            }

        } catch (error) {
            console.error('Error confirming payment:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to confirm payment',
                error: error.message
            });
        }
    };

    // Get payment history for user
    getPaymentHistory = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { page = 1, limit = 10, status } = req.query;
            const userId = req.userId;

            const skip = (page - 1) * limit;
            const filters = { patient_id: userId };

            if (status) {
                filters.payment_status = status;
            }

            const appointments = await Appointment.find(filters)
                .populate('doctor_id', 'first_name last_name specialization')
                .populate('therapy_id', 'title category')
                .select('appointment_date start_time end_time price currency payment_status payment_method created_at')
                .sort({ created_at: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Appointment.countDocuments(filters);

            return response.sendSuccess({
                message: 'Payment history retrieved successfully',
                data: {
                    payments: appointments,
                    pagination: {
                        current_page: parseInt(page),
                        total_pages: Math.ceil(total / limit),
                        total_payments: total,
                        has_next: page < Math.ceil(total / limit),
                        has_prev: page > 1
                    }
                }
            });

        } catch (error) {
            console.error('Error getting payment history:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to retrieve payment history',
                error: error.message
            });
        }
    };

    // Refund payment (Admin only)
    refundPayment = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { appointment_id, reason } = req.body;
            const adminId = req.userId;

            const appointment = await Appointment.findById(appointment_id)
                .populate('therapy_id', 'title');

            if (!appointment) {
                return response.sendError({
                    statusCode: 404,
                    message: 'Appointment not found'
                });
            }

            if (appointment.payment_status !== 'paid') {
                return response.sendError({
                    statusCode: 400,
                    message: 'Appointment is not paid'
                });
            }

            if (!appointment.payment_id) {
                return response.sendError({
                    statusCode: 400,
                    message: 'No payment ID found for this appointment'
                });
            }

            // Create refund in Stripe
            const refund = await stripe.refunds.create({
                payment_intent: appointment.payment_id,
                reason: 'requested_by_customer',
                metadata: {
                    appointment_id: appointment._id.toString(),
                    refunded_by: adminId,
                    reason: reason || 'No reason provided'
                }
            });

            // Update appointment status
            appointment.payment_status = 'refunded';
            appointment.status = 'cancelled';
            appointment.cancellation_reason = reason || 'Refunded by admin';
            appointment.cancelled_by = 'admin';
            appointment.cancelled_at = new Date();

            await appointment.save();

            return response.sendSuccess({
                message: 'Payment refunded successfully',
                data: {
                    refund_id: refund.id,
                    amount: refund.amount / 100, // Convert from cents
                    currency: refund.currency,
                    status: refund.status,
                    appointment_id: appointment._id
                }
            });

        } catch (error) {
            console.error('Error refunding payment:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to refund payment',
                error: error.message
            });
        }
    };

    // Get payment statistics (Admin only)
    getPaymentStatistics = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { start_date, end_date } = req.query;

            const matchStage = {};
            if (start_date && end_date) {
                matchStage.created_at = {
                    $gte: new Date(start_date),
                    $lte: new Date(end_date)
                };
            }

            const stats = await Appointment.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        total_appointments: { $sum: 1 },
                        total_revenue: { $sum: '$price' },
                        paid_appointments: {
                            $sum: { $cond: [{ $eq: ['$payment_status', 'paid'] }, 1, 0] }
                        },
                        pending_payments: {
                            $sum: { $cond: [{ $eq: ['$payment_status', 'pending'] }, 1, 0] }
                        },
                        failed_payments: {
                            $sum: { $cond: [{ $eq: ['$payment_status', 'failed'] }, 1, 0] }
                        },
                        refunded_payments: {
                            $sum: { $cond: [{ $eq: ['$payment_status', 'refunded'] }, 1, 0] }
                        },
                        total_paid_revenue: {
                            $sum: { $cond: [{ $eq: ['$payment_status', 'paid'] }, '$price', 0] }
                        }
                    }
                }
            ]);

            const result = stats[0] || {
                total_appointments: 0,
                total_revenue: 0,
                paid_appointments: 0,
                pending_payments: 0,
                failed_payments: 0,
                refunded_payments: 0,
                total_paid_revenue: 0
            };

            // Calculate success rate
            result.payment_success_rate = result.total_appointments > 0 
                ? ((result.paid_appointments / result.total_appointments) * 100).toFixed(2)
                : 0;

            return response.sendSuccess({
                message: 'Payment statistics retrieved successfully',
                data: result
            });

        } catch (error) {
            console.error('Error getting payment statistics:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to retrieve payment statistics',
                error: error.message
            });
        }
    };

    // Webhook for Stripe events
    handleStripeWebhook = async (req, res) => {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        try {
            // Handle the event
            switch (event.type) {
                case 'payment_intent.succeeded':
                    const paymentIntent = event.data.object;
                    await this.handlePaymentSuccess(paymentIntent);
                    break;
                case 'payment_intent.payment_failed':
                    const failedPayment = event.data.object;
                    await this.handlePaymentFailure(failedPayment);
                    break;
                case 'charge.dispute.created':
                    const dispute = event.data.object;
                    await this.handleDispute(dispute);
                    break;
                default:
                    console.log(`Unhandled event type ${event.type}`);
            }

            res.json({ received: true });
        } catch (error) {
            console.error('Error handling webhook:', error);
            res.status(500).json({ error: 'Webhook handler failed' });
        }
    };

    // Handle successful payment
    handlePaymentSuccess = async (paymentIntent) => {
        try {
            const appointment = await Appointment.findOne({ payment_id: paymentIntent.id });
            if (appointment) {
                appointment.payment_status = 'paid';
                appointment.status = 'confirmed';
                await appointment.save();
                console.log(`Payment succeeded for appointment ${appointment._id}`);
            }
        } catch (error) {
            console.error('Error handling payment success:', error);
        }
    };

    // Handle failed payment
    handlePaymentFailure = async (paymentIntent) => {
        try {
            const appointment = await Appointment.findOne({ payment_id: paymentIntent.id });
            if (appointment) {
                appointment.payment_status = 'failed';
                await appointment.save();
                console.log(`Payment failed for appointment ${appointment._id}`);
            }
        } catch (error) {
            console.error('Error handling payment failure:', error);
        }
    };

    // Handle dispute
    handleDispute = async (dispute) => {
        try {
            const appointment = await Appointment.findOne({ payment_id: dispute.payment_intent });
            if (appointment) {
                // Notify admin about dispute
                console.log(`Dispute created for appointment ${appointment._id}: ${dispute.reason}`);
                // You can add notification logic here
            }
        } catch (error) {
            console.error('Error handling dispute:', error);
        }
    };
}

export default new PaymentController();
