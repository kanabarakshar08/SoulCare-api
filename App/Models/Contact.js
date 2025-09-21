import { model, Schema } from 'mongoose';

const contactSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[0-9+\-\s()]+$/, 'Please provide a valid phone number']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    category: {
        type: String,
        enum: [
            'general_inquiry',
            'technical_support',
            'billing_issue',
            'appointment_help',
            'therapy_inquiry',
            'complaint',
            'suggestion',
            'partnership',
            'media_inquiry',
            'other'
        ],
        default: 'general_inquiry'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['new', 'in_progress', 'resolved', 'closed'],
        default: 'new'
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    assigned_to: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    response: {
        type: String,
        maxlength: [2000, 'Response cannot exceed 2000 characters']
    },
    responded_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    responded_at: {
        type: Date,
        default: null
    },
    attachments: [{
        filename: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        file_size: {
            type: Number,
            required: true
        },
        mime_type: {
            type: String,
            required: true
        }
    }],
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    follow_up_required: {
        type: Boolean,
        default: false
    },
    follow_up_date: {
        type: Date,
        default: null
    },
    source: {
        type: String,
        enum: ['website', 'mobile_app', 'api', 'email', 'phone', 'other'],
        default: 'website'
    },
    ip_address: {
        type: String,
        default: null
    },
    user_agent: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for better performance
contactSchema.index({ status: 1, priority: 1 });
contactSchema.index({ category: 1 });
contactSchema.index({ user_id: 1 });
contactSchema.index({ assigned_to: 1 });
contactSchema.index({ created_at: -1 });
contactSchema.index({ email: 1 });
contactSchema.index({ subject: 'text', message: 'text' });

// Virtual for formatted priority
contactSchema.virtual('priority_label').get(function() {
    const labels = {
        low: 'Low Priority',
        medium: 'Medium Priority',
        high: 'High Priority',
        urgent: 'Urgent'
    };
    return labels[this.priority] || 'Unknown';
});

// Virtual for formatted status
contactSchema.virtual('status_label').get(function() {
    const labels = {
        new: 'New',
        in_progress: 'In Progress',
        resolved: 'Resolved',
        closed: 'Closed'
    };
    return labels[this.status] || 'Unknown';
});

// Method to assign to staff member
contactSchema.methods.assignTo = function(staffId) {
    this.assigned_to = staffId;
    this.status = 'in_progress';
    return this.save();
};

// Method to respond to contact
contactSchema.methods.respond = function(response, responderId) {
    this.response = response;
    this.responded_by = responderId;
    this.responded_at = new Date();
    this.status = 'resolved';
    return this.save();
};

// Method to close contact
contactSchema.methods.close = function() {
    this.status = 'closed';
    return this.save();
};

// Static method to get contact statistics
contactSchema.statics.getStatistics = async function(startDate, endDate) {
    const matchStage = {};
    
    if (startDate && endDate) {
        matchStage.created_at = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const stats = await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                total_contacts: { $sum: 1 },
                new_contacts: {
                    $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
                },
                in_progress_contacts: {
                    $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
                },
                resolved_contacts: {
                    $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                },
                closed_contacts: {
                    $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
                },
                urgent_contacts: {
                    $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
                },
                high_priority_contacts: {
                    $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] }
                }
            }
        }
    ]);

    return stats[0] || {
        total_contacts: 0,
        new_contacts: 0,
        in_progress_contacts: 0,
        resolved_contacts: 0,
        closed_contacts: 0,
        urgent_contacts: 0,
        high_priority_contacts: 0
    };
};

// Pre-save middleware to set priority based on category
contactSchema.pre('save', function(next) {
    // Auto-set priority based on category
    if (this.isNew) {
        const priorityMap = {
            'complaint': 'high',
            'billing_issue': 'high',
            'technical_support': 'medium',
            'appointment_help': 'medium',
            'therapy_inquiry': 'medium',
            'general_inquiry': 'low',
            'suggestion': 'low',
            'partnership': 'low',
            'media_inquiry': 'low',
            'other': 'low'
        };
        
        if (!this.priority || this.priority === 'medium') {
            this.priority = priorityMap[this.category] || 'medium';
        }
    }
    
    next();
});

const Contact = model('Contact', contactSchema);

export default Contact;
