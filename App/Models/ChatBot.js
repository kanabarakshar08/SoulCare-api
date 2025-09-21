import mongoose from 'mongoose';

export const chatBotSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    session_id: {
        type: String,
        required: true,
        index: true
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        message_type: {
            type: String,
            enum: ['text', 'image', 'file'],
            default: 'text'
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    }],
    conversation_summary: {
        type: String,
        default: ''
    },
    mental_health_concerns: [{
        concern_type: {
            type: String,
            enum: ['anxiety', 'depression', 'stress', 'panic', 'sleep', 'mood', 'social', 'trauma', 'other'],
            required: true
        },
        severity: {
            type: String,
            enum: ['low', 'moderate', 'high', 'critical'],
            required: true
        },
        description: String,
        detected_at: {
            type: Date,
            default: Date.now
        }
    }],
    risk_assessment: {
        suicide_risk: {
            type: String,
            enum: ['none', 'low', 'moderate', 'high', 'critical'],
            default: 'none'
        },
        self_harm_risk: {
            type: String,
            enum: ['none', 'low', 'moderate', 'high', 'critical'],
            default: 'none'
        },
        crisis_intervention_needed: {
            type: Boolean,
            default: false
        },
        last_assessed: {
            type: Date,
            default: Date.now
        }
    },
    recommendations: [{
        type: {
            type: String,
            enum: ['self_help', 'professional_help', 'emergency_contact', 'resource', 'exercise', 'meditation'],
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: String,
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium'
        },
        suggested_at: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['active', 'paused', 'completed', 'escalated'],
        default: 'active'
    },
    is_escalated: {
        type: Boolean,
        default: false
    },
    escalated_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Doctor or admin who was notified
    },
    escalated_at: {
        type: Date
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
chatBotSchema.index({ user_id: 1, session_id: 1 });
chatBotSchema.index({ 'risk_assessment.suicide_risk': 1 });
chatBotSchema.index({ 'risk_assessment.self_harm_risk': 1 });
chatBotSchema.index({ is_escalated: 1 });
chatBotSchema.index({ created_at: -1 });

// Pre-save middleware to update updated_at
chatBotSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

// Virtual for message count
chatBotSchema.virtual('message_count').get(function() {
    return this.messages.length;
});

// Method to add a new message
chatBotSchema.methods.addMessage = function(role, content, messageType = 'text', metadata = {}) {
    this.messages.push({
        role,
        content,
        message_type: messageType,
        metadata,
        timestamp: new Date()
    });
    return this.save();
};

// Method to update risk assessment
chatBotSchema.methods.updateRiskAssessment = function(assessment) {
    this.risk_assessment = {
        ...this.risk_assessment,
        ...assessment,
        last_assessed: new Date()
    };
    return this.save();
};

// Method to add recommendation
chatBotSchema.methods.addRecommendation = function(recommendation) {
    this.recommendations.push({
        ...recommendation,
        suggested_at: new Date()
    });
    return this.save();
};

// Method to escalate conversation
chatBotSchema.methods.escalate = function(escalatedTo) {
    this.is_escalated = true;
    this.escalated_to = escalatedTo;
    this.escalated_at = new Date();
    this.status = 'escalated';
    return this.save();
};

const ChatBot = mongoose.model('ChatBot', chatBotSchema);

export default ChatBot;
