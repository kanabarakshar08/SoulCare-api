import ChatBotService from '../../Services/AI/ChatBotService.js';
import ChatBot from '../../Models/ChatBot.js';
import { ROLES } from '../../utils/Enum.js';
import Response from '../../utils/response.js';

class ChatBotController {
    // Send message to AI chatbot
    sendMessage = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { message, session_id } = req.body;
            const userId = req.userId;
            
            if (!message || message.trim().length === 0) {
                return response.sendError({
                    statusCode: 400,
                    message: 'Message cannot be empty'
                });
            }
            
            const result = await ChatBotService.processMessage(userId, message, session_id);
            
            return response.sendSuccess({
                message: 'Message processed successfully',
                data: {
                    session_id: result.session_id,
                    response: result.response,
                    recommendations: result.recommendations,
                    concerns: result.concerns,
                    risk_level: result.risk_level,
                    should_escalate: result.should_escalate
                }
            });
            
        } catch (error) {
            console.error('Error in sendMessage:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to process message',
                error: error.message
            });
        }
    };

    // Get conversation history
    getConversationHistory = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { session_id } = req.params;
            const { limit = 50 } = req.query;
            const userId = req.userId;
            
            const history = await ChatBotService.getConversationHistory(
                userId, 
                session_id, 
                parseInt(limit)
            );
            
            if (!history) {
                return response.sendError({
                    statusCode: 404,
                    message: 'Conversation not found'
                });
            }
            
            return response.sendSuccess({
                message: 'Conversation history retrieved successfully',
                data: history
            });
            
        } catch (error) {
            console.error('Error in getConversationHistory:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to retrieve conversation history',
                error: error.message
            });
        }
    };

    // Get all user sessions
    getUserSessions = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { page = 1, limit = 10 } = req.query;
            const userId = req.userId;
            
            const sessions = await ChatBotService.getUserSessions(
                userId, 
                parseInt(page), 
                parseInt(limit)
            );
            
            return response.sendSuccess({
                message: 'User sessions retrieved successfully',
                data: sessions
            });
            
        } catch (error) {
            console.error('Error in getUserSessions:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to retrieve user sessions',
                error: error.message
            });
        }
    };

    // Start new conversation session
    startNewSession = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const userId = req.userId;
            const sessionId = `session_${userId}_${Date.now()}`;
            
            const chatSession = await ChatBotService.getOrCreateSession(userId, sessionId);
            
            return response.sendSuccess({
                message: 'New conversation session started',
                data: {
                    session_id: chatSession.session_id,
                    created_at: chatSession.created_at
                }
            });
            
        } catch (error) {
            console.error('Error in startNewSession:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to start new session',
                error: error.message
            });
        }
    };

    // End conversation session
    endSession = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { session_id } = req.params;
            const userId = req.userId;
            
            const chatSession = await ChatBot.findOne({ 
                user_id: userId, 
                session_id: session_id 
            });
            
            if (!chatSession) {
                return response.sendError({
                    statusCode: 404,
                    message: 'Session not found'
                });
            }
            
            chatSession.status = 'completed';
            await chatSession.save();
            
            return response.sendSuccess({
                message: 'Session ended successfully'
            });
            
        } catch (error) {
            console.error('Error in endSession:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to end session',
                error: error.message
            });
        }
    };

    // Get escalated conversations (for doctors/admins)
    getEscalatedConversations = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { page = 1, limit = 10, risk_level } = req.query;
            const skip = (page - 1) * limit;
            
            let query = { is_escalated: true };
            
            if (risk_level) {
                query['risk_assessment.suicide_risk'] = risk_level;
            }
            
            const conversations = await ChatBot.find(query)
                .populate('user_id', 'first_name last_name email')
                .populate('escalated_to', 'first_name last_name')
                .select('session_id user_id escalated_to escalated_at risk_assessment mental_health_concerns created_at updated_at')
                .sort({ escalated_at: -1 })
                .skip(skip)
                .limit(parseInt(limit));
            
            const total = await ChatBot.countDocuments(query);
            
            return response.sendSuccess({
                message: 'Escalated conversations retrieved successfully',
                data: {
                    conversations,
                    pagination: {
                        current_page: parseInt(page),
                        total_pages: Math.ceil(total / limit),
                        total_conversations: total,
                        has_next: page < Math.ceil(total / limit),
                        has_prev: page > 1
                    }
                }
            });
            
        } catch (error) {
            console.error('Error in getEscalatedConversations:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to retrieve escalated conversations',
                error: error.message
            });
        }
    };

    // Assign escalated conversation to doctor
    assignEscalatedConversation = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { session_id } = req.params;
            const { doctor_id } = req.body;
            const adminId = req.userId;
            
            const chatSession = await ChatBot.findOne({ 
                session_id: session_id,
                is_escalated: true 
            });
            
            if (!chatSession) {
                return response.sendError({
                    statusCode: 404,
                    message: 'Escalated conversation not found'
                });
            }
            
            chatSession.escalated_to = doctor_id;
            await chatSession.save();
            
            return response.sendSuccess({
                message: 'Conversation assigned to doctor successfully'
            });
            
        } catch (error) {
            console.error('Error in assignEscalatedConversation:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to assign conversation',
                error: error.message
            });
        }
    };

    // Get conversation analytics (for admins)
    getConversationAnalytics = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const { start_date, end_date } = req.query;
            
            let dateFilter = {};
            if (start_date && end_date) {
                dateFilter.created_at = {
                    $gte: new Date(start_date),
                    $lte: new Date(end_date)
                };
            }
            
            const analytics = await ChatBot.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: null,
                        total_conversations: { $sum: 1 },
                        total_messages: { $sum: { $size: '$messages' } },
                        escalated_conversations: {
                            $sum: { $cond: ['$is_escalated', 1, 0] }
                        },
                        high_risk_conversations: {
                            $sum: {
                                $cond: [
                                    { $in: ['$risk_assessment.suicide_risk', ['high', 'critical']] },
                                    1,
                                    0
                                ]
                            }
                        },
                        concern_types: {
                            $push: '$mental_health_concerns.concern_type'
                        }
                    }
                },
                {
                    $project: {
                        total_conversations: 1,
                        total_messages: 1,
                        escalated_conversations: 1,
                        high_risk_conversations: 1,
                        escalation_rate: {
                            $multiply: [
                                { $divide: ['$escalated_conversations', '$total_conversations'] },
                                100
                            ]
                        },
                        avg_messages_per_conversation: {
                            $divide: ['$total_messages', '$total_conversations']
                        }
                    }
                }
            ]);
            
            return response.sendSuccess({
                message: 'Analytics retrieved successfully',
                data: analytics[0] || {
                    total_conversations: 0,
                    total_messages: 0,
                    escalated_conversations: 0,
                    high_risk_conversations: 0,
                    escalation_rate: 0,
                    avg_messages_per_conversation: 0
                }
            });
            
        } catch (error) {
            console.error('Error in getConversationAnalytics:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to retrieve analytics',
                error: error.message
            });
        }
    };

    // Get user's mental health insights
    getUserInsights = async (req, res) => {
        const response = new Response(req, res);
        
        try {
            const userId = req.userId;
            
            const insights = await ChatBot.aggregate([
                { $match: { user_id: userId } },
                {
                    $group: {
                        _id: null,
                        total_sessions: { $sum: 1 },
                        total_messages: { $sum: { $size: '$messages' } },
                        concern_types: {
                            $push: '$mental_health_concerns.concern_type'
                        },
                        risk_levels: {
                            $push: {
                                suicide_risk: '$risk_assessment.suicide_risk',
                                self_harm_risk: '$risk_assessment.self_harm_risk'
                            }
                        },
                        recommendations: {
                            $push: '$recommendations.type'
                        }
                    }
                },
                {
                    $project: {
                        total_sessions: 1,
                        total_messages: 1,
                        most_common_concerns: {
                            $reduce: {
                                input: '$concern_types',
                                initialValue: {},
                                in: {
                                    $mergeObjects: [
                                        '$$value',
                                        {
                                            $arrayToObject: [
                                                {
                                                    $map: {
                                                        input: '$$this',
                                                        as: 'concern',
                                                        in: {
                                                            k: '$$concern',
                                                            v: { $add: [{ $ifNull: [{ $getField: { field: '$$concern', input: '$$value' } }, 0] }, 1] }
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        highest_risk_level: {
                            $max: [
                                '$risk_levels.suicide_risk',
                                '$risk_levels.self_harm_risk'
                            ]
                        }
                    }
                }
            ]);
            
            return response.sendSuccess({
                message: 'User insights retrieved successfully',
                data: insights[0] || {
                    total_sessions: 0,
                    total_messages: 0,
                    most_common_concerns: {},
                    highest_risk_level: 'none'
                }
            });
            
        } catch (error) {
            console.error('Error in getUserInsights:', error);
            return response.sendError({
                statusCode: 500,
                message: 'Failed to retrieve user insights',
                error: error.message
            });
        }
    };
}

export default new ChatBotController();
