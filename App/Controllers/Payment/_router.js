import { Router } from 'express';
import PaymentController from './PaymentController.js';
import Authentication, { adminAuth, patientAuth } from '../../Middleware/AuthMiddleware.js';

const route = Router();

// Patient routes (authenticated users)
route.post('/create-intent', [Authentication, patientAuth], PaymentController.createPaymentIntent);
route.post('/confirm', [Authentication, patientAuth], PaymentController.confirmPayment);
route.get('/history', [Authentication, patientAuth], PaymentController.getPaymentHistory);

// Admin routes (admins only)
route.post('/refund', [Authentication, adminAuth], PaymentController.refundPayment);
route.get('/statistics', [Authentication, adminAuth], PaymentController.getPaymentStatistics);

// Webhook route (no authentication required)
route.post('/webhook', PaymentController.handleStripeWebhook);

export default route;
