import Joi from 'joi';

// Blog Creation Validation
export const validateCreateBlog = (data) => {
    const schema = Joi.object({
        title: Joi.string()
            .min(5)
            .max(200)
            .required()
            .messages({
                'string.empty': 'Blog title is required',
                'string.min': 'Title must be at least 5 characters long',
                'string.max': 'Title cannot exceed 200 characters'
            }),
        content: Joi.string()
            .min(100)
            .required()
            .messages({
                'string.empty': 'Blog content is required',
                'string.min': 'Content must be at least 100 characters long'
            }),
        excerpt: Joi.string()
            .max(500)
            .optional()
            .messages({
                'string.max': 'Excerpt cannot exceed 500 characters'
            }),
        category: Joi.string()
            .valid(
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
            )
            .default('mental_health')
            .messages({
                'any.only': 'Invalid blog category'
            }),
        tags: Joi.array()
            .items(Joi.string().trim().lowercase())
            .max(10)
            .optional()
            .messages({
                'array.max': 'Cannot have more than 10 tags'
            }),
        featured_image: Joi.object({
            url: Joi.string().uri().required(),
            alt_text: Joi.string().max(200).optional(),
            caption: Joi.string().max(300).optional()
        }).optional(),
        images: Joi.array()
            .items(Joi.object({
                url: Joi.string().uri().required(),
                alt_text: Joi.string().max(200).optional(),
                caption: Joi.string().max(300).optional()
            }))
            .max(10)
            .optional()
            .messages({
                'array.max': 'Cannot have more than 10 images'
            }),
        status: Joi.string()
            .valid('draft', 'published', 'archived')
            .default('draft')
            .messages({
                'any.only': 'Status must be draft, published, or archived'
            }),
        is_featured: Joi.boolean()
            .default(false)
            .messages({
                'boolean.base': 'is_featured must be a boolean value'
            }),
        is_pinned: Joi.boolean()
            .default(false)
            .messages({
                'boolean.base': 'is_pinned must be a boolean value'
            }),
        seo_title: Joi.string()
            .max(60)
            .optional()
            .messages({
                'string.max': 'SEO title cannot exceed 60 characters'
            }),
        seo_description: Joi.string()
            .max(160)
            .optional()
            .messages({
                'string.max': 'SEO description cannot exceed 160 characters'
            }),
        meta_keywords: Joi.array()
            .items(Joi.string().trim().lowercase())
            .max(10)
            .optional()
            .messages({
                'array.max': 'Cannot have more than 10 meta keywords'
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

// Blog Update Validation
export const validateUpdateBlog = (data) => {
    const schema = Joi.object({
        title: Joi.string()
            .min(5)
            .max(200)
            .optional()
            .messages({
                'string.min': 'Title must be at least 5 characters long',
                'string.max': 'Title cannot exceed 200 characters'
            }),
        content: Joi.string()
            .min(100)
            .optional()
            .messages({
                'string.min': 'Content must be at least 100 characters long'
            }),
        excerpt: Joi.string()
            .max(500)
            .optional()
            .allow('')
            .messages({
                'string.max': 'Excerpt cannot exceed 500 characters'
            }),
        category: Joi.string()
            .valid(
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
            )
            .optional()
            .messages({
                'any.only': 'Invalid blog category'
            }),
        tags: Joi.array()
            .items(Joi.string().trim().lowercase())
            .max(10)
            .optional()
            .messages({
                'array.max': 'Cannot have more than 10 tags'
            }),
        featured_image: Joi.object({
            url: Joi.string().uri().required(),
            alt_text: Joi.string().max(200).optional(),
            caption: Joi.string().max(300).optional()
        }).optional(),
        images: Joi.array()
            .items(Joi.object({
                url: Joi.string().uri().required(),
                alt_text: Joi.string().max(200).optional(),
                caption: Joi.string().max(300).optional()
            }))
            .max(10)
            .optional()
            .messages({
                'array.max': 'Cannot have more than 10 images'
            }),
        status: Joi.string()
            .valid('draft', 'published', 'archived')
            .optional()
            .messages({
                'any.only': 'Status must be draft, published, or archived'
            }),
        is_featured: Joi.boolean()
            .optional()
            .messages({
                'boolean.base': 'is_featured must be a boolean value'
            }),
        is_pinned: Joi.boolean()
            .optional()
            .messages({
                'boolean.base': 'is_pinned must be a boolean value'
            }),
        seo_title: Joi.string()
            .max(60)
            .optional()
            .allow('')
            .messages({
                'string.max': 'SEO title cannot exceed 60 characters'
            }),
        seo_description: Joi.string()
            .max(160)
            .optional()
            .allow('')
            .messages({
                'string.max': 'SEO description cannot exceed 160 characters'
            }),
        meta_keywords: Joi.array()
            .items(Joi.string().trim().lowercase())
            .max(10)
            .optional()
            .messages({
                'array.max': 'Cannot have more than 10 meta keywords'
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

// Blog Query Validation
export const validateBlogQuery = (data) => {
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
            )
            .optional()
            .messages({
                'any.only': 'Invalid blog category'
            }),
        status: Joi.string()
            .valid('draft', 'published', 'archived')
            .optional()
            .messages({
                'any.only': 'Status must be draft, published, or archived'
            }),
        is_featured: Joi.boolean()
            .optional()
            .messages({
                'boolean.base': 'is_featured must be a boolean value'
            }),
        is_pinned: Joi.boolean()
            .optional()
            .messages({
                'boolean.base': 'is_pinned must be a boolean value'
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
            .valid('created_at', 'published_at', 'title', 'views', 'likes')
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
