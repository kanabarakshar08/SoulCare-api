import ChatBot from '../../Models/ChatBot.js';
import { ROLES } from '../../utils/Enum.js';
import { openai, openaiConfig, mentalHealthPrompts } from '../../config/openai.js';

class ChatBotService {
    constructor() {
        // Use OpenAI from config
        this.openai = openai;

        this.mentalHealthKeywords = {
            anxiety: ['anxious', 'worry', 'panic', 'nervous', 'fear', 'restless', 'tense'],
            depression: ['sad', 'depressed', 'hopeless', 'empty', 'worthless', 'guilty', 'tired'],
            stress: ['stressed', 'overwhelmed', 'pressure', 'burnout', 'exhausted'],
            sleep: ['insomnia', 'sleep', 'tired', 'exhausted', 'restless', 'nightmare'],
            mood: ['mood', 'emotional', 'feelings', 'upset', 'angry', 'irritable'],
            social: ['lonely', 'isolated', 'social', 'friends', 'relationship', 'family'],
            trauma: ['trauma', 'ptsd', 'flashback', 'nightmare', 'triggered', 'abuse'],
            suicide: ['suicide', 'kill myself', 'end it all', 'not worth living', 'better off dead'],
            self_harm: ['hurt myself', 'cut', 'self harm', 'harm myself', 'pain']
        };

        this.crisisKeywords = [
            'suicide', 'kill myself', 'end it all', 'not worth living', 'better off dead',
            'hurt myself', 'cut', 'self harm', 'harm myself', 'want to die'
        ];

        this.selfHelpResources = {
            breathing: {
                title: "Deep Breathing Exercise",
                description: "Try the 4-7-8 breathing technique: Inhale for 4 counts, hold for 7, exhale for 8.",
                type: "exercise"
            },
            grounding: {
                title: "5-4-3-2-1 Grounding Technique",
                description: "Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.",
                type: "exercise"
            },
            meditation: {
                title: "Mindfulness Meditation",
                description: "Focus on your breath and observe your thoughts without judgment for 5-10 minutes.",
                type: "meditation"
            }
        };

        // Use system prompt from config
        this.systemPrompt = mentalHealthPrompts.system;
    }

    // Analyze message for mental health concerns
    analyzeMentalHealthConcerns(message) {
        const concerns = [];
        const lowerMessage = message.toLowerCase();

        for (const [concernType, keywords] of Object.entries(this.mentalHealthKeywords)) {
            const foundKeywords = keywords.filter(keyword => lowerMessage.includes(keyword));
            if (foundKeywords.length > 0) {
                concerns.push({
                    concern_type: concernType,
                    severity: this.assessSeverity(foundKeywords.length, concernType),
                    description: `Detected keywords: ${foundKeywords.join(', ')}`,
                    detected_at: new Date()
                });
            }
        }

        return concerns;
    }

    // Assess severity based on keyword frequency and type
    assessSeverity(keywordCount, concernType) {
        if (concernType === 'suicide' || concernType === 'self_harm') {
            return keywordCount >= 2 ? 'critical' : 'high';
        }
        
        if (keywordCount >= 3) return 'high';
        if (keywordCount >= 2) return 'moderate';
        return 'low';
    }

    // Check for crisis situations
    checkCrisisRisk(message) {
        const lowerMessage = message.toLowerCase();
        const crisisKeywords = this.crisisKeywords.filter(keyword => lowerMessage.includes(keyword));
        
        if (crisisKeywords.length > 0) {
            return {
                suicide_risk: crisisKeywords.some(k => ['suicide', 'kill myself', 'end it all', 'not worth living', 'better off dead'].includes(k)) ? 'critical' : 'high',
                self_harm_risk: crisisKeywords.some(k => ['hurt myself', 'cut', 'self harm', 'harm myself'].includes(k)) ? 'critical' : 'high',
                crisis_intervention_needed: true
            };
        }

        return {
            suicide_risk: 'none',
            self_harm_risk: 'none',
            crisis_intervention_needed: false
        };
    }

    // Generate AI response using OpenAI
    async generateOpenAIResponse(userMessage, conversationHistory = []) {
        try {
            // Prepare conversation messages for OpenAI
            const messages = [
                { role: 'system', content: this.systemPrompt }
            ];

            // Add conversation history (last 10 messages to stay within token limits)
            const recentHistory = conversationHistory.slice(-10);
            recentHistory.forEach(msg => {
                messages.push({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                });
            });

            // Add current user message
            messages.push({ role: 'user', content: userMessage });

            const completion = await this.openai.chat.completions.create({
                model: openaiConfig.model,
                messages: messages,
                max_tokens: openaiConfig.maxTokens,
                temperature: openaiConfig.temperature,
                presence_penalty: openaiConfig.presencePenalty,
                frequency_penalty: openaiConfig.frequencyPenalty
            });

            return completion.choices[0].message.content;
        } catch (error) {
            console.error('OpenAI API Error:', error);
            // Fallback to rule-based response if OpenAI fails
            return this.generateContextualResponse(userMessage, [], conversationHistory);
        }
    }

    // Generate AI response based on context
    async generateResponse(userMessage, conversationHistory = []) {
        const concerns = this.analyzeMentalHealthConcerns(userMessage);
        const riskAssessment = this.checkCrisisRisk(userMessage);
        
        // Crisis intervention response
        if (riskAssessment.crisis_intervention_needed) {
            return {
                response: "I'm really concerned about what you're sharing. Your safety is the most important thing right now. Please reach out to a mental health professional immediately or contact a crisis helpline. You're not alone, and there are people who want to help you.",
                recommendations: [{
                    type: 'emergency_contact',
                    title: 'Crisis Helpline',
                    description: 'Call 988 (Suicide & Crisis Lifeline) or your local emergency services',
                    priority: 'urgent'
                }],
                shouldEscalate: true,
                concerns,
                riskAssessment
            };
        }

        // Generate OpenAI response
        let response = await this.generateOpenAIResponse(userMessage, conversationHistory);
        
        // Add recommendations based on concerns
        const recommendations = this.generateRecommendations(concerns, userMessage);
        
        return {
            response,
            recommendations,
            shouldEscalate: false,
            concerns,
            riskAssessment
        };
    }

    // Generate contextual response
    generateContextualResponse(message, concerns, history) {
        const lowerMessage = message.toLowerCase();
        
        // Greeting responses
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return "Hello! I'm here to listen and support you. How are you feeling today? You can share anything that's on your mind.";
        }

        // Anxiety responses
        if (concerns.some(c => c.concern_type === 'anxiety')) {
            return "I can hear that you're feeling anxious. That's completely understandable, and many people experience anxiety. Would you like to try a breathing exercise together, or would you prefer to talk about what's making you feel this way?";
        }

        // Depression responses
        if (concerns.some(c => c.concern_type === 'depression')) {
            return "I'm sorry you're going through a difficult time. Depression can feel overwhelming, but you're taking a positive step by reaching out. What's been weighing on your mind lately?";
        }

        // Stress responses
        if (concerns.some(c => c.concern_type === 'stress')) {
            return "It sounds like you're dealing with a lot of stress right now. Stress can really take a toll on our mental and physical health. What's been causing you the most stress lately?";
        }

        // Sleep issues
        if (concerns.some(c => c.concern_type === 'sleep')) {
            return "Sleep issues can really impact how we feel during the day. Poor sleep can make everything feel more difficult. Have you noticed any patterns in your sleep, or is there something specific keeping you awake?";
        }

        // General supportive response
        return "Thank you for sharing that with me. It takes courage to open up about how you're feeling. I'm here to listen and support you. Can you tell me more about what's going on?";
    }

    // Generate recommendations based on concerns
    generateRecommendations(concerns, message) {
        const recommendations = [];
        
        concerns.forEach(concern => {
            switch (concern.concern_type) {
                case 'anxiety':
                    recommendations.push({
                        type: 'exercise',
                        title: 'Breathing Exercise',
                        description: 'Try the 4-7-8 breathing technique to help calm your nervous system',
                        priority: 'high'
                    });
                    break;
                case 'depression':
                    recommendations.push({
                        type: 'professional_help',
                        title: 'Consider Professional Support',
                        description: 'A mental health professional can provide personalized support and treatment options',
                        priority: 'high'
                    });
                    break;
                case 'stress':
                    recommendations.push({
                        type: 'exercise',
                        title: 'Stress Management',
                        description: 'Try gentle exercise, meditation, or progressive muscle relaxation',
                        priority: 'medium'
                    });
                    break;
                case 'sleep':
                    recommendations.push({
                        type: 'self_help',
                        title: 'Sleep Hygiene Tips',
                        description: 'Maintain a regular sleep schedule and create a calming bedtime routine',
                        priority: 'medium'
                    });
                    break;
            }
        });

        // Add general self-help resource
        if (recommendations.length === 0) {
            recommendations.push({
                type: 'self_help',
                title: 'Mindfulness Practice',
                description: 'Try spending 5-10 minutes in mindful breathing or meditation',
                priority: 'low'
            });
        }

        return recommendations;
    }

    // Create or get existing chat session
    async getOrCreateSession(userId, sessionId = null) {
        if (!sessionId) {
            sessionId = `session_${userId}_${Date.now()}`;
        }

        let chatSession = await ChatBot.findOne({ 
            user_id: userId, 
            session_id: sessionId,
            status: 'active'
        });

        if (!chatSession) {
            chatSession = new ChatBot({
                user_id: userId,
                session_id: sessionId,
                messages: [],
                mental_health_concerns: [],
                risk_assessment: {
                    suicide_risk: 'none',
                    self_harm_risk: 'none',
                    crisis_intervention_needed: false
                },
                recommendations: [],
                status: 'active'
            });
            await chatSession.save();
        }

        return chatSession;
    }

    // Process user message and generate response
    async processMessage(userId, message, sessionId = null) {
        try {
            // Get or create session
            const chatSession = await this.getOrCreateSession(userId, sessionId);
            
            // Add user message to conversation
            await chatSession.addMessage('user', message);
            
            // Generate AI response using OpenAI
            const aiResponse = await this.generateResponse(message, chatSession.messages);
            
            // Add AI response to conversation
            await chatSession.addMessage('assistant', aiResponse.response);
            
            // Update concerns and risk assessment
            if (aiResponse.concerns.length > 0) {
                chatSession.mental_health_concerns.push(...aiResponse.concerns);
            }
            
            if (aiResponse.riskAssessment) {
                await chatSession.updateRiskAssessment(aiResponse.riskAssessment);
            }
            
            // Add recommendations
            if (aiResponse.recommendations.length > 0) {
                await chatSession.addRecommendation(aiResponse.recommendations[0]);
            }
            
            // Escalate if needed
            if (aiResponse.shouldEscalate) {
                await chatSession.escalate(null); // Will be updated when admin/doctor is assigned
            }
            
            await chatSession.save();
            
            return {
                success: true,
                session_id: chatSession.session_id,
                response: aiResponse.response,
                recommendations: aiResponse.recommendations,
                concerns: aiResponse.concerns,
                risk_level: aiResponse.riskAssessment,
                should_escalate: aiResponse.shouldEscalate
            };
            
        } catch (error) {
            console.error('Error processing chat message:', error);
            throw error;
        }
    }

    // Get conversation history
    async getConversationHistory(userId, sessionId, limit = 50) {
        const chatSession = await ChatBot.findOne({ 
            user_id: userId, 
            session_id: sessionId 
        }).select('messages mental_health_concerns risk_assessment recommendations');
        
        if (!chatSession) {
            return null;
        }
        
        return {
            session_id: chatSession.session_id,
            messages: chatSession.messages.slice(-limit),
            concerns: chatSession.mental_health_concerns,
            risk_assessment: chatSession.risk_assessment,
            recommendations: chatSession.recommendations
        };
    }

    // Get all sessions for a user
    async getUserSessions(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        
        const sessions = await ChatBot.find({ user_id: userId })
            .select('session_id created_at updated_at status is_escalated message_count')
            .sort({ updated_at: -1 })
            .skip(skip)
            .limit(limit);
            
        const total = await ChatBot.countDocuments({ user_id: userId });
        
        return {
            sessions,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(total / limit),
                total_sessions: total,
                has_next: page < Math.ceil(total / limit),
                has_prev: page > 1
            }
        };
    }
}

export default new ChatBotService();
