import { model, Schema } from 'mongoose';

export const featureSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Feature title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Feature description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    short_description: {
        type: String,
        required: [true, 'Short description is required'],
        trim: true,
        maxlength: [300, 'Short description cannot exceed 300 characters']
    },
    icon: {
        type: String,
        required: [true, 'Feature icon is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Feature category is required'],
        enum: [
            'therapy_services',
            'ai_chatbot',
            'appointment_booking',
            'payment_processing',
            'mental_health_assessment',
            'progress_tracking',
            'meditation_guided',
            'breathing_exercises',
            'mood_tracking',
            'journaling',
            'community_support',
            'expert_consultation',
            'crisis_support',
            'educational_resources',
            'mobile_app',
            'other'
        ],
        default: 'therapy_services'
    },
    type: {
        type: String,
        enum: ['service', 'tool', 'resource', 'integration', 'platform'],
        default: 'service'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'coming_soon', 'beta'],
        default: 'active'
    },
    priority: {
        type: Number,
        default: 0,
        min: [0, 'Priority cannot be negative']
    },
    is_featured: {
        type: Boolean,
        default: false
    },
    is_premium: {
        type: Boolean,
        default: false
    },
    benefits: [{
        type: String,
        trim: true,
        maxlength: [200, 'Benefit cannot exceed 200 characters']
    }],
    features: [{
        type: String,
        trim: true,
        maxlength: [200, 'Feature cannot exceed 200 characters']
    }],
    requirements: [{
        type: String,
        trim: true,
        maxlength: [200, 'Requirement cannot exceed 200 characters']
    }],
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    images: [{
        url: {
            type: String,
            required: true
        },
        alt_text: {
            type: String,
            default: ''
        },
        caption: {
            type: String,
            default: ''
        }
    }],
    demo_url: {
        type: String,
        trim: true
    },
    documentation_url: {
        type: String,
        trim: true
    },
    support_url: {
        type: String,
        trim: true
    },
    pricing: {
        free: {
            type: Boolean,
            default: true
        },
        price: {
            type: Number,
            default: 0,
            min: [0, 'Price cannot be negative']
        },
        currency: {
            type: String,
            default: 'USD',
            enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
        },
        billing_cycle: {
            type: String,
            enum: ['one_time', 'monthly', 'yearly', 'lifetime'],
            default: 'one_time'
        }
    },
    usage_stats: {
        total_users: {
            type: Number,
            default: 0
        },
        active_users: {
            type: Number,
            default: 0
        },
        total_usage: {
            type: Number,
            default: 0
        },
        rating: {
            average: {
                type: Number,
                default: 0,
                min: 0,
                max: 5
            },
            count: {
                type: Number,
                default: 0
            }
        }
    },
    technical_details: {
        api_available: {
            type: Boolean,
            default: false
        },
        mobile_support: {
            type: Boolean,
            default: true
        },
        web_support: {
            type: Boolean,
            default: true
        },
        offline_support: {
            type: Boolean,
            default: false
        },
        integration_required: {
            type: Boolean,
            default: false
        }
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator ID is required']
    },
    last_updated_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    launch_date: {
        type: Date,
        default: null
    },
    last_updated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for better performance
featureSchema.index({ category: 1, status: 1 });
featureSchema.index({ type: 1, status: 1 });
featureSchema.index({ is_featured: 1, status: 1 });
featureSchema.index({ priority: -1, created_at: -1 });
featureSchema.index({ tags: 1 });
featureSchema.index({ title: 'text', description: 'text', short_description: 'text' });

// Virtual for formatted price
featureSchema.virtual('formatted_price').get(function() {
    if (this.pricing.free) {
        return 'Free';
    }
    return `${this.pricing.currency} ${this.pricing.price.toFixed(2)}`;
});

// Method to increment usage
featureSchema.methods.incrementUsage = function() {
    this.usage_stats.total_usage += 1;
    return this.save();
};

// Method to update rating
featureSchema.methods.updateRating = function(newRating) {
    const totalRating = (this.usage_stats.rating.average * this.usage_stats.rating.count) + newRating;
    this.usage_stats.rating.count += 1;
    this.usage_stats.rating.average = totalRating / this.usage_stats.rating.count;
    return this.save();
};

// Method to increment active users
featureSchema.methods.incrementActiveUsers = function() {
    this.usage_stats.active_users += 1;
    return this.save();
};

// Method to decrement active users
featureSchema.methods.decrementActiveUsers = function() {
    if (this.usage_stats.active_users > 0) {
        this.usage_stats.active_users -= 1;
    }
    return this.save();
};

// Static method to get active features
featureSchema.statics.getActiveFeatures = function(filters = {}) {
    const query = {
        status: 'active',
        ...filters
    };
    
    return this.find(query)
        .populate('created_by', 'first_name last_name email')
        .populate('last_updated_by', 'first_name last_name email')
        .sort({ priority: -1, created_at: -1 });
};

// Static method to search features
featureSchema.statics.searchFeatures = function(searchTerm, filters = {}) {
    const query = {
        status: 'active',
        ...filters
    };
    
    if (searchTerm) {
        query.$text = { $search: searchTerm };
    }
    
    return this.find(query)
        .populate('created_by', 'first_name last_name email')
        .populate('last_updated_by', 'first_name last_name email')
        .sort({ priority: -1, created_at: -1 });
};

// Pre-save middleware
featureSchema.pre('save', function(next) {
    // Set last_updated
    this.last_updated = new Date();
    
    // Set launch_date when status changes to active
    if (this.status === 'active' && !this.launch_date) {
        this.launch_date = new Date();
    }
    
    next();
});

const Feature = model('Feature', featureSchema);

export default Feature;
