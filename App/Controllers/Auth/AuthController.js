import mongoose, { model } from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../../Models/User.js';
import Profile from '../../Models/Profile.js';
import { encrypt } from '../../Helpers/encryption.js';
import {
    validateLogin,
    validateRegister,
    validateDoctorRegister,
    validateAdminRegister,
    validateEmail,
    validatePasswordReset,
    validateProfileUpdate
} from '../../Request/UserRequest.js';
import {
    expirationTime,
    generateGmailSearchUrl,
    generateStringToken,
    getUserProfile,
} from '../../Helpers/Helper.js';
import WelcomeSendEmail from '../../Services/Email/welcomeEmail.js';
import { SETTINGS } from '../../utils/Enum.js';
import jwt from 'jsonwebtoken'

const register = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const response = new Response(req, res);

    const { error } = await validateRegister(req.body);
    if (error) throw error;

    try {
        const {
            name,
            password,
            type,
            phone,
            role = 'patient',
            is_admin = false,
            specialization,
            license_number,
            experience_years,
            bio,
            department
        } = req.body;
        const email = req.body.email.trim().toLowerCase();
        if (await User.exists({ email })) {
            return response.sendError({
                statusCode: 409,
                message: 'Email already in use.',
            });
        }

        let input = { 
            email, 
            phone, 
            is_admin, 
            role,
            password: await encrypt(password)
        };

        const [first_name, last_name] = name.trim().split(' ');
        input.first_name = first_name;
        if (last_name) input.last_name = last_name;
        const user = await User.create([input]);

        let user_name;
    
        const profile = {
            _id: user[0]._id,
            user_name: user_name = `${first_name.toLowerCase()}${last_name ? '.' + last_name.toLowerCase() : ''}${Math.floor(1000 + Math.random() * 9000)}`,
        };
        const setting = {
            _id: user[0]._id,

            // Additional settings based on role
            ...(role === 'doctor' && {
                specialization,
                license_number,
                experience_years,
                bio
            }),
            ...(role === 'admin' && {
                department
            })
        };
       

        await Profile.create([profile]);
        let verifyToken = await generateStringToken(32);
        let expiresAt = await expirationTime();

        const { error } = await WelcomeSendEmail(email, type, verifyToken,
            `${user[0]?.first_name} ${user[0]?.last_name !== null
                ? user[0]?.last_name
                : ''}`);
        if (error) throw error;

        const jwt_token = await user[0].generateAuthToken();
        
        await session.commitTransaction();
        await session.endSession();

        const userData = {
            _id: user[0]._id,
            name: `${user[0].first_name} ${user[0]?.last_name
                ? user[0]?.last_name
                : ''}`,
            email: user[0].email,
            role: user[0].role,
            token: jwt_token,
            image: await getUserProfile(user[0]._id, 'image'),
            open_email_url: await generateGmailSearchUrl(user[0].email),
        };
        return response.sendSuccess({
            statusCode: 201,
            message: 'registered successfully.',
            data: userData,
        });

    } catch (error) {
        console.log(error);
        await session.abortTransaction();
        await session.endSession();

        return response.sendError({
            statusCode: 500,
            message: 'internal server error.',
            error,
        });
    }
};

const login = async (req, res) => {
    const response = new Response(req, res);

    const { error } = await validateLogin(req.body);
    if (error) throw error;
    try {
        const {
            email,
            password,
            fcm_token,
            is_remember
        } = req.body;
        let query = { email: email.trim() };
        
        if (!email || !password) {
            return response.sendError({
                statusCode: 400,
                message: "Missing required fields.",
            });
        }

        let user = await User.findOne(query);

        if (!user) {
            return response.sendError({
                statusCode: 400,
                message: "User not found.",
            });
        }

        const validPassword = await bcrypt.compare(password,
            user.password || '');
        if (!validPassword) {
            return response.sendError(
                { message: "Invalid credentials." });
        }
        
        const isRemember = is_remember === true || is_remember === 'true';
        const jwt_token = await user.generateAuthToken(isRemember ? '30d' : '24h');
    


        const lastLogin = new Date();
        await User.findByIdAndUpdate(user._id, { last_login_at: lastLogin },
            { new: true });

        const userData = {
            _id: user._id,
            name: `${user.first_name} ${user?.last_name || ''}`,
            email: user.email,
            role: user.role,
            token: jwt_token,
            image: await getUserProfile(user._id, 'image') || null,
            isAdmin: user?.is_admin,
        };

        return response.sendSuccess({
            message: "logged in successfully.",
            data: userData,
        });
    } catch (error) {
        console.log(error);
        return response.sendError({
            message: "internal server error.",
            error,
        });
    }
};

const logout = async (req, res) => {
    const response = new Response(req, res);
    const { userId, module } = req;
    try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
    
        

        return response.sendSuccess({
            message: "Logged out successfully.",
        });
    } catch (error) {
        console.log(error);
        return response.sendError({
            message:  "Internal server error.",
            error: error.message,
        });
    }
};

const logoutAllDevice = async (req, res) => {
    const response = new Response(req, res);
    try {
        const userId = req.userId;
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return response.sendError({ message: "Token is required." });
        }
        
        return response.sendSuccess({
            message:" Logged out from all devices successfully.",
        });
    } catch (error) {
        console.log(error);
        return response.sendError({
            message:  "Internal server error.",
            error: error.message,
        });
    }
};

const resendEmail = async (req, res) => {
    const response = new Response(req, res);

    const { error } = await ValidEmail(req.body);
    if (error) throw error;
    try {
        const { email, type } = req.body;

        const user = await User.findOne({ email: email });
        if (!user) return response.sendError({
            message: "User not found.",
        });

        let token = await generateStringToken(32);
        let expiresAt = await expirationTime();
        const VerificationData = {
            email,
            token,
            expiresAt,
            type,
            user_id: user._id,
            action: 'register',
        };

        await WelcomeSendEmail(email, type, token,
            `${user?.first_name} ${user?.last_name !== null
                ? user?.last_name
                : ''}`);
        await Verification.create(VerificationData);

        return response.sendSuccess({
            message: "Verification Link sent successfully.",
            data: {
                open_email_url: await generateGmailSearchUrl(user.email),
            },
        });

    } catch (error) {
        return response.sendError({
            message: "Internal server error.",
            error,
        });
    }
};

const verifyUserAccount = async (req, res) => {
    const response = new Response(req, res);

    try {
        const { token, email } = req.body;
        const checkToken = await Verification.findOne(
            { token, email, action: 'register' });

        if (!checkToken) {
            return response.sendError({
                statusCode: 400,
                message: "Auth token is invalid.",
            });
        }

        if (Date.now() > checkToken.expiresAt) {
            return response.sendError({
                statusCode: 400,
                message: "Auth token is expired.",
            });
        }

        const user = await User.findByIdAndUpdate(
            checkToken.user_id,
            { is_verified: true },
        );

        if (!user) {
            return response.sendError({
                statusCode: 409,
                   message: "User not found.",
            });
        }
        await Verification.findByIdAndDelete(checkToken._id);
        return response.sendSuccess({
            statusCode: 200,
            message: "User verified successfully.",
        });
    } catch (error) {
        return response.sendError({
            statusCode: 500,
            message: "Internal server error.",
            error,
        });
    }
};

const checkUserIsAuthenticate = async (req, res) => {
    const response = new Response(req, res);
    const { userId, module, userData } = req;

    try {
        let data;
        if (module === MODULES.USER) {
            const profile = await Profile.findById(userId).
                populate({ path: '_id', model: 'UserPublic' }).
                select('image cover_image contact_details user_name').
                lean();

            const setting = await Setting.findById(userId);
            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: 'User or profile not found',
                });
            }

            data = {
                id: profile?._id?._id,
                first_name: profile?._id?.first_name,
                last_name: profile?._id?.last_name,
                full_last_name: profile?._id?.full_last_name,
                email: profile?._id?.email,
                isAdmin : profile?._id?.is_admin,
                image: profile?.image,
                cover_image: profile?.cover_image,
                mobile_number: profile?.contact_details?.number,
                autoplay_videos: setting[SETTINGS.GENERAL]['autoplay_videos'],
                user_name: profile?.user_name,
                module,
            };
        } else {
            data = {
                id: userId,
                first_name: userData.name,
                last_name: '',
                user_name: userData.user_name,
                image: userData.logo,
                cover_image: userData.cover_image,
                module,
            };
        }
        return response.sendSuccess({
            message: 'User is authenticated successfully.',
            data,
        });
    } catch (e) {
        console.log(e);
        return response.sendError({
            message: e.message,
        });
    }
};

const userPages = async (req, res) => {
    const response = new Response(req, res);
    const { superUserId } = req;
    try {
        const createLookups = (lookups) => {
            if (!Array.isArray(lookups)) throw Error('Lookup must be an array');

            return lookups.map((lookup) => {
                return {
                    $lookup: {
                        from: lookup.collection,
                        let: { creatorId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: { $eq: ['$user_id', '$$creatorId'] },
                                },
                            },
                            {
                                $addFields: {
                                    type: lookup.collection,
                                },
                            },
                            {
                                $project: {
                                    user_id: 1,
                                    name: 1,
                                    logo: 1,
                                    type: 1,
                                },
                            },
                        ],
                        as: lookup.collection,
                    },
                };
            });
        };
        const pages = await UserPublic.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(superUserId),
                },
            },
            {
                $lookup: {
                    from: 'profiles',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'profile',
                },
            },
            {
                $unwind: {
                    path: '$profile',
                    preserveNullAndEmptyArrays: true,
                },
            },
            ...createLookups([
                {
                    collection: 'businesses',
                },
                {
                    collection: 'institutes',
                },
            ]),
        ]);

        return response.sendSuccess({
            message: 'User pages retrieved successfully.',
            data: await new UserPageResource(pages[0]).toJSON(),
        });
    } catch (error) {
        console.log(error);
        return response.sendError({
            error: error.message,
        });
    }
};



export default {
    register,
    resendEmail,
    verifyUserAccount,
    login,
    logout,
    logoutAllDevice,
    checkUserIsAuthenticate,
    userPages,
};
