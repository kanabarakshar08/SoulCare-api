import Joi from 'joi';

// Video Creation Validation
export const validateCreateVideo = (data) => {
    const schema = Joi.object({
        title: Joi.string()
            .min(5)
            .max(200)
            .required()
            .messages({
                'string.empty': 'Video title is required',
                'string.min': 'Title must be at least 5 characters long',
                'string.max': 'Title cannot exceed 200 characters'
            }),
        description: Joi.string()
            .min(20)
            .max(1000)
            .required()
            .messages({
                'string.empty': 'Video description is required',
                'string.min': 'Description must be at least 20 characters long',
                'string.max': 'Description cannot exceed 1000 characters'
            }),
        video_url: Joi.string()
            .uri()
            .required()
            .messages({
                'string.empty': 'Video URL is required',
                'string.uri': 'Video URL must be a valid URI'
            }),
        thumbnail_url: Joi.string()
            .uri()
            .required()
            .messages({
                'string.empty': 'Thumbnail URL is required',
                'string.uri': 'Thumbnail URL must be a valid URI'
            }),
        duration: Joi.number()
            .integer()
            .min(1)
            .max(3600) // 1 hour max
            .required()
            .messages({
                'number.base': 'Duration must be a number',
                'number.integer': 'Duration must be an integer',
                'number.min': 'Duration must be at least 1 second',
                'number.max': 'Duration cannot exceed 3600 seconds'
            }),
        category: Joi.string()
            .valid(
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
            )
            .default('motivational')
            .messages({
                'any.only': 'Invalid video category'
            }),
        type: Joi.string()
            .valid('motivational', 'educational', 'therapeutic', 'exercise', 'meditation')
            .default('motivational')
            .messages({
                'any.only': 'Invalid video type'
            }),
        tags: Joi.array()
            .items(Joi.string().trim().lowercase())
            .max(15)
            .optional()
            .messages({
                'array.max': 'Cannot have more than 15 tags'
            }),
        difficulty_level: Joi.string()
            .valid('beginner', 'intermediate', 'advanced')
            .default('beginner')
            .messages({
                'any.only': 'Difficulty level must be beginner, intermediate, or advanced'
            }),
        target_audience: Joi.string()
            .valid('general', 'anxiety', 'depression', 'stress', 'trauma', 'addiction', 'relationships')
            .default('general')
            .messages({
                'any.only': 'Invalid target audience'
            }),
        is_featured: Joi.boolean()
            .default(false)
            .messages({
                'boolean.base': 'is_featured must be a boolean value'
            }),
        is_published: Joi.boolean()
            .default(false)
            .messages({
                'boolean.base': 'is_published must be a boolean value'
            }),
        is_premium: Joi.boolean()
            .default(false)
            .messages({
                'boolean.base': 'is_premium must be a boolean value'
            }),
        file_size: Joi.number()
            .integer()
            .min(0)
            .optional()
            .messages({
                'number.base': 'File size must be a number',
                'number.integer': 'File size must be an integer',
                'number.min': 'File size cannot be negative'
            }),
        resolution: Joi.string()
            .valid('480p', '720p', '1080p', '4K')
            .default('720p')
            .messages({
                'any.only': 'Resolution must be 480p, 720p, 1080p, or 4K'
            }),
        language: Joi.string()
            .max(5)
            .default('en')
            .messages({
                'string.max': 'Language code cannot exceed 5 characters'
            }),
        subtitles: Joi.array()
            .items(Joi.object({
                language: Joi.string().required(),
                url: Joi.string().uri().required()
            }))
            .max(10)
            .optional()
            .messages({
                'array.max': 'Cannot have more than 10 subtitle tracks'
            }),
        transcript: Joi.string()
            .max(10000)
            .optional()
            .allow('')
            .messages({
                'string.max': 'Transcript cannot exceed 10000 characters'
            }),
        key_points: Joi.array()
            .items(Joi.string().trim().max(200))
            .max(20)
            .optional()
            .messages({
                'array.max': 'Cannot have more than 20 key points'
            }),
        benefits: Joi.array()
            .items(Joi.string().trim().max(200))
            .max(15)
            .optional()
            .messages({
                'array.max': 'Cannot have more than 15 benefits'
            }),
        prerequisites: Joi.array()
            .items(Joi.string().trim().max(200))
            .max(10)
            .optional()
            .messages({
                'array.max': 'Cannot have more than 10 prerequisites'
            }),
        equipment_needed: Joi.array()
            .items(Joi.string().trim().max(200))
            .max(10)
            .optional()
            .messages({
                'array.max': 'Cannot have more than 10 equipment items'
            }),
        scheduled_at: Joi.date()
            .greater('now')
            .optional()
            .messages({
                'date.greater': 'Scheduled date must be in the future'
            })
    });

    return schema.validate(data);
};

// Video Update Validation
export const validateUpdateVideo = (data) => {
    const schema = Joi.object({
        title: Joi.string()
            .min(5)
            .max(200)
            .optional()
            .messages({
                'string.min': 'Title must be at least 5 characters long',
                'string.max': 'Title cannot exceed 200 characters'
            }),
        description: Joi.string()
            .min(20)
            .max(1000)
            .optional()
            .messages({
                'string.min': 'Description must be at least 20 characters long',
                'string.max': 'Description cannot exceed 1000 characters'
            }),
        video_url: Joi.string()
            .uri()
            .optional()
            .messages({
                'string.uri': 'Video URL must be a valid URI'
            }),
        thumbnail_url: Joi.string()
            .uri()
            .optional()
            .messages({
                'string.uri': 'Thumbnail URL must be a valid URI'
            }),
        duration: Joi.number()
            .integer()
            .min(1)
            .max(3600)
            .optional()
            .messages({
                'number.base': 'Duration must be a number',
                'number.integer': 'Duration must be an integer',
                'number.min': 'Duration must be at least 1 second',
                'number.max': 'Duration cannot exceed 3600 seconds'
            }),
        category: Joi.string()
            .valid(
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
            )
            .optional()
            .messages({
                'any.only': 'Invalid video category'
            }),
        type: Joi.string()
            .valid('motivational', 'educational', 'therapeutic', 'exercise', 'meditation')
            .optional()
            .messages({
                'any.only': 'Invalid video type'
            }),
        tags: Joi.array()
            .items(Joi.string().trim().lowercase())
            .max(15)
            .optional()
            .messages({
                'array.max': 'Cannot have more than 15 tags'
            }),
        difficulty_level: Joi.string()
            .valid('beginner', 'intermediate', 'advanced')
            .optional()
            .messages({
                'any.only': 'Difficulty level must be beginner, intermediate, or advanced'
            }),
        target_audience: Joi.string()
            .valid('general', 'anxiety', 'depression', 'stress', 'trauma', 'addiction', 'relationships')
            .optional()
            .messages({
                'any.only': 'Invalid target audience'
            }),
        is_featured: Joi.boolean()
            .optional()
            .messages({
                'boolean.base': 'is_featured must be a boolean value'
            }),
        is_published: Joi.boolean()
            .optional()
            .messages({
                'boolean.base': 'is_published must be a boolean value'
            }),
        is_premium: Joi.boolean()
            .optional()
            .messages({
                'boolean.base': 'is_premium must be a boolean value'
            }),
        file_size: Joi.number()
            .integer()
            .min(0)
            .optional()
            .messages({
                'number.base': 'File size must be a number',
                'number.integer': 'File size must be an integer',
                'number.min': 'File size cannot be negative'
            }),
        resolution: Joi.string()
            .valid('480p', '720p', '1080p', '4K')
            .optional()
            .messages({
                'any.only': 'Resolution must be 480p, 720p, 1080p, or 4K'
            }),
        language: Joi.string()
            .max(5)
            .optional()
            .messages({
                'string.max': 'Language code cannot exceed 5 characters'
            }),
        subtitles: Joi.array()
            .items(Joi.object({
                language: Joi.string().required(),
                url: Joi.string().uri().required()
            }))
            .max(10)
            .optional()
            .messages({
                'array.max': 'Cannot have more than 10 subtitle tracks'
            }),
        transcript: Joi.string()
            .max(10000)
            .optional()
            .allow('')
            .messages({
                'string.max': 'Transcript cannot exceed 10000 characters'
            }),
        key_points: Joi.array()
            .items(Joi.string().trim().max(200))
            .max(20)
            .optional()
            .messages({
                'array.max': 'Cannot have more than 20 key points'
            }),
        benefits: Joi.array()
            .items(Joi.string().trim().max(200))
            .max(15)
            .optional()
            .messages({
                'array.max': 'Cannot have more than 15 benefits'
            }),
        prerequisites: Joi.array()
            .items(Joi.string().trim().max(200))
            .max(10)
            .optional()
            .messages({
                'array.max': 'Cannot have more than 10 prerequisites'
            }),
        equipment_needed: Joi.array()
            .items(Joi.string().trim().max(200))
            .max(10)
            .optional()
            .messages({
                'array.max': 'Cannot have more than 10 equipment items'
            }),
        scheduled_at: Joi.date()
            .greater('now')
            .optional()
            .messages({
                'date.greater': 'Scheduled date must be in the future'
            })
    });

    return schema.validate(data);
};

// Video Query Validation
export const validateVideoQuery = (data) => {
    const schema = Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1)
            .messages({
                'number.base': 'Page must be a number',
                'number.integer': 'Page must be an integer',
                'number.min': 'Page must be at least 1'
            }),
        limit: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(10)
            .messages({
                'number.base': 'Limit must be a number',
                'number.integer': 'Limit must be an integer',
                'number.min': 'Limit must be at least 1',
                'number.max': 'Limit cannot exceed 100'
            }),
        category: Joi.string()
            .valid(
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
            )
            .optional()
            .messages({
                'any.only': 'Invalid video category'
            }),
        type: Joi.string()
            .valid('motivational', 'educational', 'therapeutic', 'exercise', 'meditation')
            .optional()
            .messages({
                'any.only': 'Invalid video type'
            }),
        difficulty_level: Joi.string()
            .valid('beginner', 'intermediate', 'advanced')
            .optional()
            .messages({
                'any.only': 'Difficulty level must be beginner, intermediate, or advanced'
            }),
        target_audience: Joi.string()
            .valid('general', 'anxiety', 'depression', 'stress', 'trauma', 'addiction', 'relationships')
            .optional()
            .messages({
                'any.only': 'Invalid target audience'
            }),
        is_featured: Joi.boolean()
            .optional()
            .messages({
                'boolean.base': 'is_featured must be a boolean value'
            }),
        is_premium: Joi.boolean()
            .optional()
            .messages({
                'boolean.base': 'is_premium must be a boolean value'
            }),
        author_id: Joi.string()
            .pattern(/^[0-9a-fA-F]{24}$/)
            .optional()
            .messages({
                'string.pattern.base': 'Invalid author ID format'
            }),
        search: Joi.string()
            .max(100)
            .optional()
            .messages({
                'string.max': 'Search term cannot exceed 100 characters'
            }),
        sort_by: Joi.string()
            .valid('created_at', 'published_at', 'title', 'views', 'likes', 'duration')
            .default('published_at')
            .messages({
                'any.only': 'Invalid sort field'
            }),
        sort_order: Joi.string()
            .valid('asc', 'desc')
            .default('desc')
            .messages({
                'any.only': 'Sort order must be asc or desc'
            })
    });

    return schema.validate(data);
};
