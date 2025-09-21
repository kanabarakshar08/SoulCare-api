import { Router } from 'express';
import AppointmentController from './AppointmentController.js';
import Authentication, { doctorAuth, patientAuth } from '../../Middleware/AuthMiddleware.js';

const route = Router();

// Patient routes (authenticated users)
route.post('/book', [Authentication, patientAuth], AppointmentController.bookAppointment);
route.get('/patient', Authentication, AppointmentController.getPatientAppointments);
route.get('/available-slots', Authentication, AppointmentController.getAvailableSlots);
route.get('/:id', Authentication, AppointmentController.getAppointmentById);
route.post('/:id/cancel', Authentication, AppointmentController.cancelAppointment);
route.post('/:id/rate', [Authentication, patientAuth], AppointmentController.rateAppointment);

// Doctor routes (doctors and admins)
route.get('/doctor/schedule', [Authentication, doctorAuth], AppointmentController.getDoctorAppointments);
route.put('/:id/status', [Authentication, doctorAuth], AppointmentController.updateAppointmentStatus);

export default route;
