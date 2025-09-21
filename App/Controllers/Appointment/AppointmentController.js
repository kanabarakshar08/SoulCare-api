import Appointment from '../../Models/Appointment.js';
import Therapy from '../../Models/Therapy.js';
import User from '../../Models/User.js';
import Response from '../../utils/response.js';
import { ROLES } from '../../utils/Enum.js';

class AppointmentController {
    // Book appointment (Patient only)
    bookAppointment = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const {
                doctor_id,
                therapy_id,
                appointment_date,
                start_time,
                end_time,
                session_type,
                notes = '',
                patient_notes = ''
            } = req.body;

            const patientId = req.userId;

            // Verify patient role
            const patient = await User.findById(patientId);
            if (!patient || patient.role !== ROLES.PATIENT) {
                return response.sendError({
                    statusCode: 403,
                    message: 'Only patients can book appointments'
                });
            }

            // Verify doctor exists
            const doctor = await User.findById(doctor_id);
            if (!doctor || doctor.role !== ROLES.DOCTOR) {
                return response.sendError({
                    statusCode: 404,
                    message: 'Doctor not found'
                });
            }

            // Verify therapy exists and belongs to doctor
            const therapy = await Therapy.findById(therapy_id);
            if (!therapy || therapy.doctor_id.toString() !== doctor_id) {
                return response.sendError({
                    statusCode: 404,
                    message: 'Therapy not found or does not belong to this doctor'
                });
            }

            // Check if therapy is active
            if (!therapy.is_active) {
                return response.sendError({
                    statusCode: 400,
                    message: 'This therapy is no longer available'
                });
            }

            // Check if session type is available
            if (session_type === 'online' && !therapy.is_online) {
                return response.sendError({
                    statusCode: 400,
                    message: 'Online sessions are not available for this therapy'
                });
            }

            if (session_type === 'in_person' && !therapy.is_in_person) {
                return response.sendError({
                    statusCode: 400,
                    message: 'In-person sessions are not available for this therapy'
                });
            }

            // Check for conflicting appointments
            const conflictingAppointment = await Appointment.findOne({
                doctor_id,
                appointment_date: new Date(appointment_date),
                $or: [
                    {
                        start_time: { $lt: end_time },
                        end_time: { $gt: start_time }
                    }
                ],
                status: { $nin: ['cancelled', 'no_show'] }
            });

            if (conflictingAppointment) {
                return response.sendError({
                    statusCode: 409,
                    message: 'Time slot is already booked'
                });
            }

            // Calculate duration
            const startTime = new Date(`2000-01-01T${start_time}:00`);
            const endTime = new Date(`2000-01-01T${end_time}:00`);
            const duration_minutes = (endTime - startTime) / (1000 * 60);

            const appointment = new Appointment({
                patient_id: patientId,
                doctor_id,
                therapy_id,
                appointment_date: new Date(appointment_date),
                start_time,
                end_time,
                duration_minutes,
                session_type,
                notes,
                patient_notes,
                price: therapy.price,
                currency: therapy.currency
            });

            await appointment.save();

            // Populate the appointment with related data
            await appointment.populate([
                { path: 'patient_id', select: 'first_name last_name email' },
                { path: 'doctor_id', select: 'first_name last_name email specialization' },
                { path: 'therapy_id', select: 'title category duration_minutes' }
            ]);

            return response.sendSuccess({
                statusCode: 201,
                message: 'Appointment booked successfully',
                data: appointment
            });

        } catch (error) {
            console.error('Error booking appointment:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to book appointment',
                error: error.message
            });
        }
    };

    // Get patient appointments
    getPatientAppointments = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { page = 1, limit = 10, status, upcoming = false } = req.query;
            const patientId = req.userId;

            const skip = (page - 1) * limit;
            const filters = { patient_id: patientId };

            if (status) {
                filters.status = status;
            }

            if (upcoming === 'true') {
                filters.appointment_date = { $gte: new Date() };
                filters.status = { $in: ['scheduled', 'confirmed'] };
            }

            const appointments = await Appointment.find(filters)
                .populate('doctor_id', 'first_name last_name email specialization')
                .populate('therapy_id', 'title category duration_minutes price currency')
                .sort({ appointment_date: -1, start_time: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Appointment.countDocuments(filters);

            return response.sendSuccess({
                message: 'Patient appointments retrieved successfully',
                data: {
                    appointments,
                    pagination: {
                        current_page: parseInt(page),
                        total_pages: Math.ceil(total / limit),
                        total_appointments: total,
                        has_next: page < Math.ceil(total / limit),
                        has_prev: page > 1
                    }
                }
            });

        } catch (error) {
            console.error('Error getting patient appointments:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to retrieve appointments',
                error: error.message
            });
        }
    };

    // Get doctor appointments
    getDoctorAppointments = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { page = 1, limit = 10, status, date } = req.query;
            const doctorId = req.userId;

            const skip = (page - 1) * limit;
            const filters = { doctor_id: doctorId };

            if (status) {
                filters.status = status;
            }

            if (date) {
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);
                
                filters.appointment_date = {
                    $gte: startOfDay,
                    $lte: endOfDay
                };
            }

            const appointments = await Appointment.find(filters)
                .populate('patient_id', 'first_name last_name email')
                .populate('therapy_id', 'title category duration_minutes')
                .sort({ appointment_date: 1, start_time: 1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Appointment.countDocuments(filters);

            return response.sendSuccess({
                message: 'Doctor appointments retrieved successfully',
                data: {
                    appointments,
                    pagination: {
                        current_page: parseInt(page),
                        total_pages: Math.ceil(total / limit),
                        total_appointments: total,
                        has_next: page < Math.ceil(total / limit),
                        has_prev: page > 1
                    }
                }
            });

        } catch (error) {
            console.error('Error getting doctor appointments:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to retrieve appointments',
                error: error.message
            });
        }
    };

    // Get appointment by ID
    getAppointmentById = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { id } = req.params;
            const userId = req.userId;
            const userRole = req.user.role;

            const appointment = await Appointment.findById(id)
                .populate('patient_id', 'first_name last_name email')
                .populate('doctor_id', 'first_name last_name email specialization')
                .populate('therapy_id', 'title category duration_minutes price currency');

            if (!appointment) {
                return response.sendError({
                    statusCode: 404,
                    message: 'Appointment not found'
                });
            }

            // Check if user has permission to view this appointment
            const canView = 
                appointment.patient_id._id.toString() === userId ||
                appointment.doctor_id._id.toString() === userId ||
                userRole === ROLES.ADMIN;

            if (!canView) {
                return response.sendError({
                    statusCode: 403,
                    message: 'You do not have permission to view this appointment'
                });
            }

            return response.sendSuccess({
                message: 'Appointment retrieved successfully',
                data: appointment
            });

        } catch (error) {
            console.error('Error getting appointment:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to retrieve appointment',
                error: error.message
            });
        }
    };

    // Cancel appointment
    cancelAppointment = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const userId = req.userId;
            const userRole = req.user.role;

            const appointment = await Appointment.findById(id);
            if (!appointment) {
                return response.sendError({
                    statusCode: 404,
                    message: 'Appointment not found'
                });
            }

            // Check if user can cancel this appointment
            const canCancel = 
                appointment.patient_id.toString() === userId ||
                appointment.doctor_id.toString() === userId ||
                userRole === ROLES.ADMIN;

            if (!canCancel) {
                return response.sendError({
                    statusCode: 403,
                    message: 'You do not have permission to cancel this appointment'
                });
            }

            // Check if appointment can be cancelled
            if (!appointment.canBeCancelled()) {
                return response.sendError({
                    statusCode: 400,
                    message: 'Appointment cannot be cancelled less than 24 hours before the scheduled time'
                });
            }

            appointment.status = 'cancelled';
            appointment.cancellation_reason = reason;
            appointment.cancelled_by = 
                appointment.patient_id.toString() === userId ? 'patient' :
                appointment.doctor_id.toString() === userId ? 'doctor' : 'admin';
            appointment.cancelled_at = new Date();

            await appointment.save();

            return response.sendSuccess({
                message: 'Appointment cancelled successfully'
            });

        } catch (error) {
            console.error('Error cancelling appointment:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to cancel appointment',
                error: error.message
            });
        }
    };

    // Update appointment status (Doctor only)
    updateAppointmentStatus = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { id } = req.params;
            const { status, doctor_notes } = req.body;
            const doctorId = req.userId;

            const appointment = await Appointment.findById(id);
            if (!appointment) {
                return response.sendError({
                    statusCode: 404,
                    message: 'Appointment not found'
                });
            }

            // Check if user is the doctor for this appointment
            if (appointment.doctor_id.toString() !== doctorId) {
                return response.sendError({
                    statusCode: 403,
                    message: 'You can only update your own appointments'
                });
            }

            appointment.status = status;
            if (doctor_notes) {
                appointment.doctor_notes = doctor_notes;
            }

            await appointment.save();

            return response.sendSuccess({
                message: 'Appointment status updated successfully',
                data: appointment
            });

        } catch (error) {
            console.error('Error updating appointment status:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to update appointment status',
                error: error.message
            });
        }
    };

    // Get available time slots for a doctor
    getAvailableSlots = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { doctorId, date, duration = 60 } = req.query;

            if (!doctorId || !date) {
                return response.sendError({
                    statusCode: 400,
                    message: 'Doctor ID and date are required'
                });
            }

            const slots = await Appointment.getAvailableSlots(doctorId, date, parseInt(duration));

            return response.sendSuccess({
                message: 'Available slots retrieved successfully',
                data: {
                    doctor_id: doctorId,
                    date,
                    available_slots: slots
                }
            });

        } catch (error) {
            console.error('Error getting available slots:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to retrieve available slots',
                error: error.message
            });
        }
    };

    // Rate appointment (Patient only)
    rateAppointment = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { id } = req.params;
            const { rating, feedback } = req.body;
            const patientId = req.userId;

            if (rating < 1 || rating > 5) {
                return response.sendError({
                    statusCode: 400,
                    message: 'Rating must be between 1 and 5'
                });
            }

            const appointment = await Appointment.findById(id);
            if (!appointment) {
                return response.sendError({
                    statusCode: 404,
                    message: 'Appointment not found'
                });
            }

            // Check if user is the patient for this appointment
            if (appointment.patient_id.toString() !== patientId) {
                return response.sendError({
                    statusCode: 403,
                    message: 'You can only rate your own appointments'
                });
            }

            // Check if appointment is completed
            if (appointment.status !== 'completed') {
                return response.sendError({
                    statusCode: 400,
                    message: 'You can only rate completed appointments'
                });
            }

            appointment.rating.patient_rating = rating;
            if (feedback) {
                appointment.rating.patient_feedback = feedback;
            }

            await appointment.save();

            return response.sendSuccess({
                message: 'Appointment rated successfully'
            });

        } catch (error) {
            console.error('Error rating appointment:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to rate appointment',
                error: error.message
            });
        }
    };
}

export default new AppointmentController();
