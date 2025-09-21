import { model, Schema } from 'mongoose';
import jwt from 'jsonwebtoken';

export const UserSchema = new Schema(
    {
        first_name: {
            type: String,
            required: [true, 'The first name is required.'],
        },
        last_name: {
            type: String,
            default: null,
        },
        email: { type: String, required: true },
        password: { type: String, default: null },
        contact_email: { type: String },
        customer_id: {
            type: String,
            default: null,
        },
        is_admin: {
            type: Boolean,
            default: false,
        },
        role: {
            type: String,
            enum: ['patient', 'doctor', 'admin'],
            default: 'patient',
        },
        profile: {
            dateOfBirth: Date,
            gender: {
                type: String,
                enum: ['male', 'female', 'other']
            },
            phone: String,
            address: {
                street: String,
                city: String,
                state: String,
                zipCode: String
            },
            specialization: { // For doctors
                type: String
            },
            qualifications: { // For doctors
                type: [String]
            },
            yearsOfExperience: { // For doctors
                type: Number
            },
            healthConditions: { // For patients
                type: [String]
            }
        },
        is_verified: {
            type: Boolean,
            default: false,
        },
        last_login_at: {
            type: Date,
            default: new Date(),
        },
    },
    {
        timestamps: true,
    },
);

UserSchema.methods.generateAuthToken = function (expiresIn = '24h') {
    return jwt.sign(
        {
            uid: this._id,
            is_admin: this.is_admin,
            role: this.role,
            email: this.email
        },
        process.env.JWT_PRIVATE_KEY,
        {
            expiresIn,
        },
    );
};

const User = model('User', UserSchema);


export default User;
