import { Router } from 'express';
import TherapyController from './TherapyController.js';
import Authentication, { doctorAuth, adminAuth } from '../../Middleware/AuthMiddleware.js';

const route = Router();

// Public routes (no authentication required)
route.get('/', TherapyController.getAllTherapies);
route.get('/categories', TherapyController.getTherapyCategories);
route.get('/search', TherapyController.searchTherapies);
route.get('/:id', TherapyController.getTherapyById);

// Doctor routes (doctors and admins)
route.post('/', [Authentication, doctorAuth], TherapyController.createTherapy);
route.put('/:id', [Authentication, doctorAuth], TherapyController.updateTherapy);
route.delete('/:id', [Authentication, doctorAuth], TherapyController.deleteTherapy);
route.get('/doctor/:doctorId', [Authentication, doctorAuth], TherapyController.getDoctorTherapies);

// Patient routes (authenticated users)
route.post('/:id/rate', Authentication, TherapyController.updateTherapyRating);

export default route;
