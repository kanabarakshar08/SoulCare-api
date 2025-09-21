import Joi from 'joi';

// User Registration Validation
export const validateRegister = (data) => {
    const schema = Joi.object({
        name: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.empty': 'Name is required',
                'string.min': 'Name must be at least 2 characters long',
                'string.max': 'Name cannot exceed 50 characters'
            }),
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.empty': 'Email is required',
                'string.email': 'Please provide a valid email address'
            }),
        password: Joi.string()
            .min(6)
            .max(128)
            .required()
            .messages({
                'string.empty': 'Password is required',
                'string.min': 'Password must be at least 6 characters long',
                'string.max': 'Password cannot exceed 128 characters'
            }),
        phone: Joi.string()
            .pattern(/^[0-9+\-\s()]+$/)
            .optional()
            .messages({
                'string.pattern.base': 'Please provide a valid phone number'
            }),
        role: Joi.string()
            .valid('patient', 'doctor', 'admin')
            .default('patient')
            .messages({
                'any.only': 'Role must be patient, doctor, or admin'
            }),
        is_admin: Joi.boolean()
            .default(false)
            .messages({
                'boolean.base': 'is_admin must be a boolean value'
            })
    });

    return schema.validate(data);
};

// User Login Validation
export const validateLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.empty': 'Email is required',
                'string.email': 'Please provide a valid email address'
            }),
        password: Joi.string()
            .required()
            .messages({
                'string.empty': 'Password is required'
            }),
        fcm_token: Joi.string()
            .optional()
            .messages({
                'string.base': 'FCM token must be a string'
            }),
        is_remember: Joi.boolean()
            .optional()
            .messages({
                'boolean.base': 'is_remember must be a boolean value'
            })
    });

    return schema.validate(data);
};

// Doctor Registration Validation
export const validateDoctorRegister = (data) => {
    const schema = Joi.object({
        name: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.empty': 'Name is required',
                'string.min': 'Name must be at least 2 characters long',
                'string.max': 'Name cannot exceed 50 characters'
            }),
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.empty': 'Email is required',
                'string.email': 'Please provide a valid email address'
            }),
        password: Joi.string()
            .min(6)
            .max(128)
            .required()
            .messages({
                'string.empty': 'Password is required',
                'string.min': 'Password must be at least 6 characters long',
                'string.max': 'Password cannot exceed 128 characters'
            }),
        phone: Joi.string()
            .pattern(/^[0-9+\-\s()]+$/)
            .required()
            .messages({
                'string.empty': 'Phone number is required',
                'string.pattern.base': 'Please provide a valid phone number'
            }),
        specialization: Joi.string()
            .min(2)
            .max(100)
            .required()
            .messages({
                'string.empty': 'Specialization is required',
                'string.min': 'Specialization must be at least 2 characters long',
                'string.max': 'Specialization cannot exceed 100 characters'
            }),
        license_number: Joi.string()
            .min(5)
            .max(50)
            .required()
            .messages({
                'string.empty': 'License number is required',
                'string.min': 'License number must be at least 5 characters long',
                'string.max': 'License number cannot exceed 50 characters'
            }),
        experience_years: Joi.number()
            .integer()
            .min(0)
            .max(50)
            .required()
            .messages({
                'number.base': 'Experience years must be a number',
                'number.integer': 'Experience years must be a whole number',
                'number.min': 'Experience years cannot be negative',
                'number.max': 'Experience years cannot exceed 50'
            }),
        bio: Joi.string()
            .max(1000)
            .optional()
            .messages({
                'string.max': 'Bio cannot exceed 1000 characters'
            })
    });

    return schema.validate(data);
};

// Admin Registration Validation
export const validateAdminRegister = (data) => {
    const schema = Joi.object({
        name: Joi.string()
            .min(2)
            .max(50)
            .required()
            .messages({
                'string.empty': 'Name is required',
                'string.min': 'Name must be at least 2 characters long',
                'string.max': 'Name cannot exceed 50 characters'
            }),
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.empty': 'Email is required',
                'string.email': 'Please provide a valid email address'
            }),
        password: Joi.string()
            .min(6)
            .max(128)
            .required()
            .messages({
                'string.empty': 'Password is required',
                'string.min': 'Password must be at least 6 characters long',
                'string.max': 'Password cannot exceed 128 characters'
            }),
        phone: Joi.string()
            .pattern(/^[0-9+\-\s()]+$/)
            .required()
            .messages({
                'string.empty': 'Phone number is required',
                'string.pattern.base': 'Please provide a valid phone number'
            }),
        department: Joi.string()
            .min(2)
            .max(100)
            .optional()
            .messages({
                'string.min': 'Department must be at least 2 characters long',
                'string.max': 'Department cannot exceed 100 characters'
            })
    });

    return schema.validate(data);
};

// Email Validation
export const validateEmail = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.empty': 'Email is required',
                'string.email': 'Please provide a valid email address'
            })
    });

    return schema.validate(data);
};

// Password Reset Validation
export const validatePasswordReset = (data) => {
    const schema = Joi.object({
        token: Joi.string()
            .required()
            .messages({
                'string.empty': 'Reset token is required'
            }),
        password: Joi.string()
            .min(6)
            .max(128)
            .required()
            .messages({
                'string.empty': 'Password is required',
                'string.min': 'Password must be at least 6 characters long',
                'string.max': 'Password cannot exceed 128 characters'
            }),
        confirmPassword: Joi.string()
            .valid(Joi.ref('password'))
            .required()
            .messages({
                'string.empty': 'Confirm password is required',
                'any.only': 'Passwords do not match'
            })
    });

    return schema.validate(data);
};

// Profile Update Validation
export const validateProfileUpdate = (data) => {
    const schema = Joi.object({
        first_name: Joi.string()
            .min(2)
            .max(50)
            .optional()
            .messages({
                'string.min': 'First name must be at least 2 characters long',
                'string.max': 'First name cannot exceed 50 characters'
            }),
        last_name: Joi.string()
            .min(2)
            .max(50)
            .optional()
            .messages({
                'string.min': 'Last name must be at least 2 characters long',
                'string.max': 'Last name cannot exceed 50 characters'
            }),
        phone: Joi.string()
            .pattern(/^[0-9+\-\s()]+$/)
            .optional()
            .messages({
                'string.pattern.base': 'Please provide a valid phone number'
            }),
        bio: Joi.string()
            .max(1000)
            .optional()
            .messages({
                'string.max': 'Bio cannot exceed 1000 characters'
            })
    });

    return schema.validate(data);
};
