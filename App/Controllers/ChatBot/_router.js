import { Router } from 'express';
import ChatBotController from './ChatBotController.js';
import Authentication, { adminAuth, doctorAuth } from '../../Middleware/AuthMiddleware.js';

const route = Router();

// Patient routes (authenticated users)
route.post('/send-message', Authentication, ChatBotController.sendMessage);
route.get('/conversation/:session_id', Authentication, ChatBotController.getConversationHistory);
route.get('/sessions', Authentication, ChatBotController.getUserSessions);
route.post('/start-session', Authentication, ChatBotController.startNewSession);
route.post('/end-session/:session_id', Authentication, ChatBotController.endSession);
route.get('/insights', Authentication, ChatBotController.getUserInsights);

// Doctor routes (doctors and admins)
route.get('/escalated', [Authentication, doctorAuth], ChatBotController.getEscalatedConversations);
route.post('/assign/:session_id', [Authentication, doctorAuth], ChatBotController.assignEscalatedConversation);

// Admin routes (admins only)
route.get('/analytics', [Authentication, adminAuth], ChatBotController.getConversationAnalytics);

export default route;
