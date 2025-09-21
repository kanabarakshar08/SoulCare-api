import Joi from 'joi';

// User validation schemas
const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'doctor', 'patient').default('patient'),
    profile: Joi.object({
        dateOfBirth: Joi.date(),
        gender: Joi.string().valid('male', 'female', 'other'),
        phone: Joi.string().pattern(/^[0-9]{10}$/),
        address: Joi.object({
            street: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            zipCode: Joi.string()
        }),
        specialization: Joi.string(), // For doctors
        qualifications: Joi.array().items(Joi.string()), // For doctors
        yearsOfExperience: Joi.number().min(0), // For doctors
        healthConditions: Joi.array().items(Joi.string()) // For patients
    })
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});


const motivationalContentSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    videoUrl: Joi.string().uri().required(),
    category: Joi.string().required(),
    duration: Joi.number().min(0),
    tags: Joi.array().items(Joi.string())
});

const appointmentSchema = Joi.object({
    date: Joi.date().required(),
    time: Joi.string().required(),
    reason: Joi.string().required(),
    status: Joi.string().valid('scheduled', 'completed', 'cancelled').default('scheduled')
});

export default {
    registerSchema,
    loginSchema,
    motivationalContentSchema,
    appointmentSchema
};