import mongoose, { model } from 'mongoose';
import moment from 'moment';
import crypto from 'crypto';
import db from '../Database/db.js';
import User from '../Models/User.js';

export const getAdminContactEmail = async () => {
    if (!global.adminContactEmail) {
        const user = await User.findOne({ is_admin: true });
        global.adminContactEmail = user?.contact_email || user?.email;
    }

    return global.adminContactEmail;
};

export function generateGmailSearchUrl(email) {
    const baseUrl = 'https://mail.google.com/mail/u/';
    const searchQuery = `#search/from%3A%40${encodeURIComponent(
        process.env.BREVO_FROM_EMAIL)}+in%3Aanywhere+newer_than%3A1d`;
    return `${baseUrl}${encodeURIComponent(email)}/${searchQuery}`;
}

export const getUserProfile = async (
    id, need = '-createdAt -updatedAt -__v') => {
    const profile = await Profile.findById(id).select(`${need}`);
    if (!profile) return null;
    return profile[need] || null;
};

export const generateStringToken = (length = 10) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
};

export const generateNumericOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

export const expirationTime = () => {
    return new Date(Date.now() + 10 * 60 * 1000);
};

export const dbConnectionStart = async () => {
    await db();
};

export const dbConnectionEnd = async () => {
    await mongoose.disconnect();
};






