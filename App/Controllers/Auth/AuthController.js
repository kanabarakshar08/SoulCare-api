import mongoose, { model } from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../../Models/User.js';
import { encrypt } from '../../Helpers/encryption.js';
// import {
//     validateLogin,
//     validateRegister,
//     validateDoctorRegister,
//     validateAdminRegister,
//     validateEmail,
//     validatePasswordReset,
//     validateProfileUpdate
// } from '../../Request/UserRequest.js';
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
                message: req.__('Auth.EMAIL_EXISTS'),
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
        const user = await User.create([input], { session });

        let user_name;
        let isUnique = false;

        while (!isUnique) {
            const generatedName = generateUniqueUserName(first_name, last_name);
            const exists = await Profile.exists({ user_name: generatedName });
            if (!exists) {
                user_name = generatedName;
                isUnique = true;
            }
        }
        const profile = {
            _id: user[0]._id,
            user_name,
        };
        const setting = {
            _id: user[0]._id,
            linked_accounts: {
                google: 0,
                facebook: 0,
            },
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
        const defaultVisibility = {
            module_id: user[0]._id,
            module_type: 'user',
            visibility: {
                profile_photo: VISIBILITY.Anyone,
                skills: VISIBILITY.Anyone,
                about_me: VISIBILITY.Anyone,
                educations: VISIBILITY.Anyone,
                contact_details: VISIBILITY.Anyone,
                work_experience: VISIBILITY.Anyone,
                languages: VISIBILITY.Anyone,
                projects: VISIBILITY.Anyone,
                achievements: VISIBILITY.Anyone,
            },
        };

        await Profile.create([profile], { session });
        await Setting.create([setting], { session });
        await Visibility.create([defaultVisibility], { session });
        let verifyToken = await generateStringToken(32);
        let expiresAt = await expirationTime();


        const verifications = new Verification({
            token: verifyToken,
            user_id: user[0]._id,
            email: input.email,
            expiresAt,
            type,
            action: 'register',
        });

        const { error } = await WelcomeSendEmail(email, type, verifyToken,
            `${user[0]?.first_name} ${user[0]?.last_name !== null
                ? user[0]?.last_name
                : ''}`);
        if (error) throw error;

        await Verification.create(verifications);
        const jwt_token = await user[0].generateAuthToken();
        const session = new Session({
            user_id: user[0]._id,
            token: jwt_token,
        });
        await session.save();

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
            message: req.__('Auth.USER_REGISTER_SUCCESS'),
            data: userData,
        });

    } catch (error) {
        console.log(error);
        await session.abortTransaction();
        await session.endSession();

        return response.sendError({
            statusCode: 500,
            message: req.__('SERVER_ERROR'),
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
                message: req.__('Auth.MISSING_CREDENTIALS'),
            });
        }

        let user = await User.findOne(query);

        if (!user) {
            return response.sendError({
                statusCode: 400,
                message: req.__('Auth.USER_NOT_FOUND'),
            });
        } else if (!user.is_verified) {
            return response.sendError({
                message: req.__('Auth.USER_NOT_VERIFY'),
            });
        }

        const validPassword = await bcrypt.compare(password,
            user.password || '');
        if (!validPassword) {
            return response.sendError(
                { message: AppStrings.EN.Auth.INVALID_PASSWORD });
        }
        
        const isRemember = is_remember === true || is_remember === 'true';
        const jwt_token = await user.generateAuthToken(isRemember ? '30d' : '24h');
        const session = new Session({
            user_id: user._id,
            token: jwt_token,
            expires_at: isRemember
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                : new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        await session.save();

        if (fcm_token?.length > 0) {
            await FcmToken.findOneAndUpdate(
                { user_id: user._id.toString() },
                {
                    type: req.type,
                    token: fcm_token,
                    user_id: user._id.toString(),
                },
                {
                    upsert: true,
                    new: true,
                },
            );
        }

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
            message: req.__('Auth.USER_LOGIN_SUCCESS'),
            data: userData,
        });
    } catch (error) {
        console.log(error);
        return response.sendError({
            message: req.__('SERVER_ERROR'),
            error,
        });
    }
};

const logout = async (req, res) => {
    const response = new Response(req, res);
    const { userId, module } = req;
    try {
        if (module === MODULES.USER) {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            const user = await Session.findOne({ user_id: userId, token: token });

            if (!user) {
                return response.sendError(
                    { message: req.__('Auth.TOKEN_INVALID') });
            }
            await Session.deleteOne({ user_id: userId, token: token });
        }

        return response.sendSuccess({
            message: req.__('Auth.USER_LOGOUT_SUCCESS'),
        });
    } catch (error) {
        console.log(error);
        return response.sendError({
            message:  req.__('SERVER_ERROR'),
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
            return response.sendError({ message: req.__('Auth.TOKEN_INVALID') });
        }
        const userSession = await Session.findOne({
            user_id: userId, token: token,
        });

        if (!userSession) {
            return response.sendError({ message: req.__('Auth.TOKEN_INVALID') });
        }
        await Session.deleteMany({ user_id: userId });

        return response.sendSuccess({
            message: req.__('Auth.USER_LOGOUT_ALL_SUCCESS'),
        });
    } catch (error) {
        console.log(error);
        return response.sendError({
            message:  req.__('SERVER_ERROR'),
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
            message: req.__('Auth.USER_NOT_FOUND'),
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
            message: req.__('LINK_SEND_SUCCESS'),
            data: {
                open_email_url: await generateGmailSearchUrl(user.email),
            },
        });

    } catch (error) {
        return response.sendError({
            message: req.__('SERVER_ERROR'),
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
                message: req.__ ('Auth.TOKEN_INVALID'),
            });
        }

        if (Date.now() > checkToken.expiresAt) {
            return response.sendError({
                statusCode: 400,
                message: req.__('Auth.LINK_EXPIRED'),
            });
        }

        const user = await User.findByIdAndUpdate(
            checkToken.user_id,
            { is_verified: true },
        );

        if (!user) {
            return response.sendError({
                statusCode: 409,
                   message: req.__('Auth.USER_NOT_FOUND'),
            });
        }
        await Verification.findByIdAndDelete(checkToken._id);
        return response.sendSuccess({
            statusCode: 200,
            message: req.__('Auth.EMAIL_VERIFY_SUCCESS'),
        });
    } catch (error) {
        return response.sendError({
            statusCode: 500,
            message: req.__('SERVER_ERROR'),
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

const switchPages = async (req, res) => {
    const response = new Response(req, res);
    const { superUserId, body: { page_id, module } } = req;

    try {
        if (!module || !page_id) return response.sendError({
            error: 'Both page_id and module are required to switch pages.',
        });

        const moduleToModelMap = {
            [MODULES.USER]: model('User'),
            [MODULES.BUSINESS]: model('Business'),
            [MODULES.INSTITUTE]: model('Institute'),
        };

        const pageModel = moduleToModelMap[module];
        if (!pageModel) return response.sendError({
            error: 'Invalid module specified.',
        });

        const queryCondition = module === MODULES.USER
            ? { _id: superUserId }
            : { user_id: superUserId, _id: page_id };

        const foundPage = await pageModel.exists(queryCondition);
        const modelData = await pageModel.aggregate([
            {
              $match: {
                  _id: new mongoose.Types.ObjectId(page_id),
              },  
            },
            {
                $lookup: {
                    from: 'suspend_pages',
                    localField: '_id',
                    foreignField: 'module_id',
                    as: 'suspend_pages',
                },
            },
            {
                $addFields: {
                    is_suspend: { $gt: [{ $size: '$suspend_pages' }, 0] },
                },
            },
        ]);
        
        if(modelData && modelData[0]?.is_suspend){
            return response.sendError({
                message: 'Your account has been suspended. Please contact to admin for more information.',
                statusCode: 403,
            });
        }
        
        if (!foundPage) return response.sendError({
              message: req.__('Auth.PAGE_NOT_FOUND', { module }),
        });
        const token = jwt.sign(
            { uid: page_id, module },
            process.env.JWT_PRIVATE_KEY,
            {
                expiresIn: '24h',
            });

        if (module === MODULES.USER) {
            const session = new Session({
                user_id: superUserId,
                token,
            });
            await session.save();
        }

        return response.sendSuccess({
            message: req.__('Auth.PAGE_SWITCH_SUCCESS'),
            data: { token },
        });
    } catch (error) {
        console.error('Error in switchPages:', error);
        return response.sendError({
            message : req._("SERVER_ERROR"),
            error: error.message || 'An unexpected error occurred.',
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
    switchPages,
};
