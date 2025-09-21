import { model, Schema } from 'mongoose';

export const videoSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Video title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Video description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    video_url: {
        type: String,
        required: [true, 'Video URL is required'],
        trim: true
    },
    thumbnail_url: {
        type: String,
        required: [true, 'Thumbnail URL is required'],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'Video duration is required'],
        min: [1, 'Duration must be at least 1 second']
    },
    category: {
        type: String,
        required: [true, 'Video category is required'],
        enum: [
            'motivational',
            'meditation',
            'breathing_exercises',
            'stress_relief',
            'anxiety_management',
            'depression_support',
            'mindfulness',
            'yoga',
            'therapy_techniques',
            'self_care',
            'mental_health_education',
            'success_stories',
            'expert_talks',
            'guided_visualization',
            'relaxation',
            'other'
        ],
        default: 'motivational'
    },
    type: {
        type: String,
        enum: ['motivational', 'educational', 'therapeutic', 'exercise', 'meditation'],
        default: 'motivational'
    },
    author_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author ID is required']
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    difficulty_level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    target_audience: {
        type: String,
        enum: ['general', 'anxiety', 'depression', 'stress', 'trauma', 'addiction', 'relationships'],
        default: 'general'
    },
    is_featured: {
        type: Boolean,
        default: false
    },
    is_published: {
        type: Boolean,
        default: false
    },
    is_premium: {
        type: Boolean,
        default: false
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    },
    comments_count: {
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
    },
    file_size: {
        type: Number,
        default: 0 // in bytes
    },
    resolution: {
        type: String,
        enum: ['480p', '720p', '1080p', '4K'],
        default: '720p'
    },
    language: {
        type: String,
        default: 'en',
        maxlength: [5, 'Language code cannot exceed 5 characters']
    },
    subtitles: [{
        language: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }],
    transcript: {
        type: String,
        default: ''
    },
    key_points: [{
        type: String,
        trim: true
    }],
    benefits: [{
        type: String,
        trim: true
    }],
    prerequisites: [{
        type: String,
        trim: true
    }],
    equipment_needed: [{
        type: String,
        trim: true
    }],
    published_at: {
        type: Date,
        default: null
    },
    scheduled_at: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for better performance
videoSchema.index({ author_id: 1, is_published: 1 });
videoSchema.index({ category: 1, is_published: 1 });
videoSchema.index({ type: 1, is_published: 1 });
videoSchema.index({ is_featured: 1, is_published: 1 });
videoSchema.index({ tags: 1 });
videoSchema.index({ title: 'text', description: 'text' });
videoSchema.index({ published_at: -1 });

// Virtual for formatted duration
videoSchema.virtual('formatted_duration').get(function() {
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Virtual for formatted file size
videoSchema.virtual('formatted_file_size').get(function() {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (this.file_size === 0) return '0 Bytes';
    const i = Math.floor(Math.log(this.file_size) / Math.log(1024));
    return Math.round(this.file_size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Method to increment views
videoSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

// Method to like video
videoSchema.methods.like = function() {
    this.likes += 1;
    return this.save();
};

// Method to unlike video
videoSchema.methods.unlike = function() {
    if (this.likes > 0) {
        this.likes -= 1;
    }
    return this.save();
};

// Method to update rating
videoSchema.methods.updateRating = function(newRating) {
    const totalRating = (this.rating.average * this.rating.count) + newRating;
    this.rating.count += 1;
    this.rating.average = totalRating / this.rating.count;
    return this.save();
};

// Static method to get published videos
videoSchema.statics.getPublishedVideos = function(filters = {}) {
    const query = {
        is_published: true,
        published_at: { $lte: new Date() },
        ...filters
    };
    
    return this.find(query)
        .populate('author_id', 'first_name last_name email specialization')
        .sort({ published_at: -1 });
};

// Static method to search videos
videoSchema.statics.searchVideos = function(searchTerm, filters = {}) {
    const query = {
        is_published: true,
        published_at: { $lte: new Date() },
        ...filters
    };
    
    if (searchTerm) {
        query.$text = { $search: searchTerm };
    }
    
    return this.find(query)
        .populate('author_id', 'first_name last_name email specialization')
        .sort({ published_at: -1 });
};

// Pre-save middleware
videoSchema.pre('save', function(next) {
    // Set published_at when is_published changes to true
    if (this.is_published && !this.published_at) {
        this.published_at = new Date();
    }
    
    next();
});

const Video = model('Video', videoSchema);

export default Video;
