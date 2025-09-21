import { model, Schema } from 'mongoose';

export const therapySchema = new Schema({
    title: {
        type: String,
        required: [true, 'Therapy title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Therapy description is required'],
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
        type: String,
        required: [true, 'Therapy category is required'],
        enum: [
            'individual',
            'group',
            'couples',
            'family',
            'cognitive_behavioral',
            'dialectical_behavior',
            'psychodynamic',
            'humanistic',
            'trauma_therapy',
            'addiction_therapy',
            'anxiety_therapy',
            'depression_therapy',
            'other'
        ],
        default: 'individual'
    },
    duration_minutes: {
        type: Number,
        required: [true, 'Session duration is required'],
        min: [15, 'Minimum session duration is 15 minutes'],
        max: [300, 'Maximum session duration is 300 minutes']
    },
    price: {
        type: Number,
        required: [true, 'Therapy price is required'],
        min: [0, 'Price cannot be negative']
    },
    currency: {
        type: String,
        default: 'USD',
        enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
    },
    doctor_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Doctor ID is required']
    },
    is_active: {
        type: Boolean,
        default: true
    },
    is_online: {
        type: Boolean,
        default: false
    },
    is_in_person: {
        type: Boolean,
        default: true
    },
    max_participants: {
        type: Number,
        default: 1,
        min: [1, 'Maximum participants must be at least 1'],
        max: [50, 'Maximum participants cannot exceed 50']
    },
    requirements: [{
        type: String,
        trim: true
    }],
    benefits: [{
        type: String,
        trim: true
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
        }
    }],
    availability: {
        monday: [{
            start_time: String,
            end_time: String,
            is_available: { type: Boolean, default: true }
        }],
        tuesday: [{
            start_time: String,
            end_time: String,
            is_available: { type: Boolean, default: true }
        }],
        wednesday: [{
            start_time: String,
            end_time: String,
            is_available: { type: Boolean, default: true }
        }],
        thursday: [{
            start_time: String,
            end_time: String,
            is_available: { type: Boolean, default: true }
        }],
        friday: [{
            start_time: String,
            end_time: String,
            is_available: { type: Boolean, default: true }
        }],
        saturday: [{
            start_time: String,
            end_time: String,
            is_available: { type: Boolean, default: false }
        }],
        sunday: [{
            start_time: String,
            end_time: String,
            is_available: { type: Boolean, default: false }
        }]
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
    },
    total_sessions: {
        type: Number,
        default: 0
    },
    total_revenue: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for better performance
therapySchema.index({ doctor_id: 1, is_active: 1 });
therapySchema.index({ category: 1, is_active: 1 });
therapySchema.index({ price: 1 });
therapySchema.index({ 'rating.average': -1 });
therapySchema.index({ tags: 1 });
therapySchema.index({ title: 'text', description: 'text' });

// Virtual for formatted price
therapySchema.virtual('formatted_price').get(function() {
    return `${this.currency} ${this.price.toFixed(2)}`;
});

// Virtual for duration in hours
therapySchema.virtual('duration_hours').get(function() {
    return (this.duration_minutes / 60).toFixed(1);
});

// Method to update rating
therapySchema.methods.updateRating = function(newRating) {
    const totalRating = (this.rating.average * this.rating.count) + newRating;
    this.rating.count += 1;
    this.rating.average = totalRating / this.rating.count;
    return this.save();
};

// Method to check availability for a specific time
therapySchema.methods.isAvailableAt = function(dayOfWeek, time) {
    const dayAvailability = this.availability[dayOfWeek.toLowerCase()];
    if (!dayAvailability || dayAvailability.length === 0) return false;
    
    return dayAvailability.some(slot => 
        slot.is_available && 
        time >= slot.start_time && 
        time <= slot.end_time
    );
};

// Static method to search therapies
therapySchema.statics.searchTherapies = function(query, filters = {}) {
    const searchQuery = {
        is_active: true,
        ...filters
    };

    if (query) {
        searchQuery.$text = { $search: query };
    }

    return this.find(searchQuery)
        .populate('doctor_id', 'first_name last_name email specialization')
        .sort({ 'rating.average': -1, createdAt: -1 });
};

// Pre-save middleware to validate availability
therapySchema.pre('save', function(next) {
    // Ensure at least one delivery method is selected
    if (!this.is_online && !this.is_in_person) {
        return next(new Error('At least one delivery method (online or in-person) must be selected'));
    }
    
    // Validate max participants based on category
    if (this.category === 'individual' && this.max_participants > 1) {
        return next(new Error('Individual therapy cannot have more than 1 participant'));
    }
    
    next();
});

const Therapy = model('Therapy', therapySchema);

export default Therapy;
