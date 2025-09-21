import { model, Schema } from 'mongoose';

export const blogSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Blog title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: {
        type: String,
        required: [true, 'Blog slug is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    content: {
        type: String,
        required: [true, 'Blog content is required'],
        trim: true
    },
    excerpt: {
        type: String,
        maxlength: [500, 'Excerpt cannot exceed 500 characters'],
        trim: true
    },
    author_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author ID is required']
    },
    category: {
        type: String,
        required: [true, 'Blog category is required'],
        enum: [
            'mental_health',
            'anxiety',
            'depression',
            'stress_management',
            'therapy_insights',
            'self_care',
            'mindfulness',
            'relationships',
            'workplace_mental_health',
            'parenting',
            'addiction_recovery',
            'trauma_healing',
            'wellness_tips',
            'research_insights',
            'success_stories',
            'other'
        ],
        default: 'mental_health'
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    featured_image: {
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
    },
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
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    is_featured: {
        type: Boolean,
        default: false
    },
    is_pinned: {
        type: Boolean,
        default: false
    },
    reading_time: {
        type: Number,
        default: 0 // in minutes
    },
    word_count: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    comments_count: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    },
    seo_title: {
        type: String,
        maxlength: [60, 'SEO title cannot exceed 60 characters']
    },
    seo_description: {
        type: String,
        maxlength: [160, 'SEO description cannot exceed 160 characters']
    },
    meta_keywords: [{
        type: String,
        trim: true,
        lowercase: true
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
blogSchema.index({ author_id: 1, status: 1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ status: 1, published_at: -1 });
blogSchema.index({ is_featured: 1, published_at: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ title: 'text', content: 'text', excerpt: 'text' });
blogSchema.index({ slug: 1 });

// Virtual for formatted reading time
blogSchema.virtual('formatted_reading_time').get(function() {
    if (this.reading_time < 1) {
        return 'Less than 1 min read';
    }
    return `${this.reading_time} min read`;
});

// Method to generate slug from title
blogSchema.methods.generateSlug = function() {
    const slug = this.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
    
    return `${slug}-${Date.now()}`;
};

// Method to calculate reading time
blogSchema.methods.calculateReadingTime = function() {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.word_count = wordCount;
    this.reading_time = Math.ceil(wordCount / wordsPerMinute);
    return this.reading_time;
};

// Method to increment views
blogSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

// Method to like blog
blogSchema.methods.like = function() {
    this.likes += 1;
    return this.save();
};

// Method to unlike blog
blogSchema.methods.unlike = function() {
    if (this.likes > 0) {
        this.likes -= 1;
    }
    return this.save();
};

// Static method to get published blogs
blogSchema.statics.getPublishedBlogs = function(filters = {}) {
    const query = {
        status: 'published',
        published_at: { $lte: new Date() },
        ...filters
    };
    
    return this.find(query)
        .populate('author_id', 'first_name last_name email specialization')
        .sort({ published_at: -1 });
};

// Static method to search blogs
blogSchema.statics.searchBlogs = function(searchTerm, filters = {}) {
    const query = {
        status: 'published',
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
blogSchema.pre('save', function(next) {
    // Generate slug if not provided
    if (!this.slug) {
        this.slug = this.generateSlug();
    }
    
    // Calculate reading time and word count
    this.calculateReadingTime();
    
    // Set published_at when status changes to published
    if (this.status === 'published' && !this.published_at) {
        this.published_at = new Date();
    }
    
    next();
});

const Blog = model('Blog', blogSchema);

export default Blog;
