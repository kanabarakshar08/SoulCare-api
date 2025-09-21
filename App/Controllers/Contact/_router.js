import { Router } from 'express';
import ContactController from './ContactController.js';
import Authentication, { adminAuth, doctorAuth } from '../../Middleware/AuthMiddleware.js';

const route = Router();

// Public routes (no authentication required)
route.post('/submit', ContactController.submitContact);
route.get('/categories', ContactController.getContactCategories);

// Authenticated user routes
route.get('/user', Authentication, ContactController.getUserContacts);

// Admin/Staff routes (admins and doctors)
route.get('/', [Authentication, adminAuth], ContactController.getAllContacts);
route.get('/statistics', [Authentication, adminAuth], ContactController.getContactStatistics);
route.get('/:id', [Authentication, adminAuth], ContactController.getContactById);
route.post('/:id/assign', [Authentication, adminAuth], ContactController.assignContact);
route.post('/:id/respond', [Authentication, adminAuth], ContactController.respondToContact);
route.put('/:id/status', [Authentication, adminAuth], ContactController.updateContactStatus);
route.post('/:id/close', [Authentication, adminAuth], ContactController.closeContact);

export default route;
