import User from "../../Models/User.js";
import { generateStringToken, expirationTime, generateGmailSearchUrl } from '../../Helpers/Helper.js';
// import { ValidEmail, validPassword } from '../../Request/AuthRequest.js'
import bcrypt from 'bcrypt';
import { ResetPassword } from '../../Services/Email/ResetPassword.js';
import Joi from "joi";

const changePassword = async (req, res) => {
    const response = new Response(req, res);
    const { error } = await validPassword(req.body);
    if (error) throw error;
    try {
        const { current_password, new_password, confirm_password } = req.body;
        const userId = req.userId;

        const user = await User.findById(userId);

        if (!user) return response.sendError({ 
            message: AppStrings.EN.Auth.USER_NOT_FOUND 
        });

        if (current_password === new_password) return response.sendError({ 
            message: req.__('Auth.CURRENT_PASSWORD_SAME_AS_NEW_PASSWORD') 
        });

        if (user.password != null) {
            const isValidPassword = await bcrypt.compare(current_password, user.password);
            if (!isValidPassword) return response.sendError({
                message: req.__('Auth.CURRENT_PASSWORD_INCORRECT'),
            });
            user.password = await bcrypt.hash(confirm_password, 10);
        } else {
            user.password = await bcrypt.hash(confirm_password, 10);
        }
        user.save();
        return response.sendSuccess({
            message: req.__('Auth.USER_RESET_PASSWORD_SUCCESS'),
        });

    } catch (error) {
        return response.sendError({
            message: req.__('SERVER_ERROR'),
            error
        });
    }
};


const sendTokenToUser = async (req, res) => {
    const response = new Response(req, res);

    const { error } = await ValidEmail(req.body);
    if (error) throw error;
    try {

        const { email, type } = req.body;

        const user = await User.findOne({ email: email });
        if (!user) return response.sendError({
            message: req.__('Auth.USER_NOT_FOUND'),
        });

        let token = generateStringToken(32);
        let expiresAt = expirationTime();
        const VerificationData = { email, token, expiresAt, type , action : "reset_password"};

        await ResetPassword(type, token, email, `${user?.first_name} ${user?.last_name !== null ? user?.last_name : ''}`);
        await Verification.create(VerificationData);
        let emailurl = {
            open_email_url: await generateGmailSearchUrl(user.email)
        }
        return response.sendSuccess({
            message: req.__('Auth.LINK_SEND_SUCCESS'),
            data: emailurl
        });


    } catch (error) {
        return response.sendError({
            message: req.__('SERVER_ERROR'),
            error
        });
    }
};

const resendEmail = async (req, res) => {
    const response = new Response(req, res);

    const { error } = await ValidEmail(req.body);
    if (error) throw error
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
            action : "reset_password"
        };

        await ResetPassword(type, token, email, `${user?.first_name} ${user?.last_name !== null ? user?.last_name : ''}`);
        await Verification.create(VerificationData);

        return response.sendSuccess({
            message: req.__('Auth.LINK_SEND_SUCCESS'),
            data: {
                open_email_url: await generateGmailSearchUrl(user.email)
            },
        });

    } catch (error) {
        console.log(error)
        return response.sendError({
            message: req.__('SERVER_ERROR'),
            error,
        });
    }
};

const verifytoken = async (req, res) => {
    const response = new Response(req, res);
    try {
        const { token } = req.body;
        const checkOtp = await Verification.findOne({ token ,  action : "reset_password"})
        if (!checkOtp) return response.sendError({
            message: req.__('Auth.TOKEN_INVALID'),
        });
        if (Date.now() > checkOtp.expiresAt) {
            return response.sendError({ message: req.__('Auth.TOKEN_EXPIRED') });
        }
        return response.sendSuccess({ message: req.__('Auth.EMAIL_VERIFY_SUCCESS') });
    } catch (error) {
        return response.sendError({
            message: req.__('SERVER_ERROR'),
            error
        })
    }
}

const resetPassword = async (req, res) => {
    const response = new Response(req, res);
    const { error } = await validateResetPassword(req.body);
    if (error) throw error;
    try {
        const { new_password, token, type, email } = req.body;
        let user, tokenData;
        if (type == 'web') {
            tokenData = await Verification.findOne({ token, type: 'web' , action : "reset_password" });

            if (!tokenData) return response.sendError({
                message: req.__('Auth.TOKEN_INVALID')
            });

            if (Date.now() > tokenData.expiresAt) return response.sendError({
                message: req.__('Auth.TOKEN_EXPIRED')
            });
            user = await User.findOne({ email: tokenData.email });
        } else if (type == 'mobile') {
            const tokenData = await Verification.findOne({ email , action : "reset_password"});
            if (!tokenData.token) {
                return response.sendError({ message: req.__('Auth.TOKEN_INVALID') })
            }
            if (Date.now() > tokenData.expiresAt) {
                return response.sendError({ message: req.__('Auth.TOKEN_EXPIRED') })
            }
            user = await User.findOne({ email });
        }

        if (!user) return response.sendError({ message: req.__('Auth.USER_NOT_FOUND') });

        user.password = await bcrypt.hash(new_password, 10);
        let updatedUser = user.save();
        if (!updatedUser) return response.sendError({
            statusCode: 500,
            message: req.__('Auth.PASSWORD_UPDATE_FAILED'),
        });
        await Verification.findByIdAndDelete(tokenData._id)
        return response.sendSuccess({
            message: req.__('Auth.USER_RESET_PASSWORD_SUCCESS')
        });

    } catch (error) {
        return response.sendError({
            message: req.__('SERVER_ERROR'),
            error
        })
    }
};

const validateResetPassword = (data) => {
    const schema = Joi.object({
        new_password: Joi.string().min(8).max(100).pattern(new RegExp(
            '^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])')).
            required().
            label('New Password'),
        confirm_password: Joi.string().
            valid(Joi.ref('new_password')).
            required().
            label('Confirm Password').
            messages({ 'any.only': 'Confirm Password must match New Password.' }),
        token: Joi.when('type', {
            is: 'web',
            then: Joi.string().required().label('Token'),
            otherwise: Joi.forbidden().label('Token')
        }),
        email: Joi.when('type', {
            is: 'mobile',
            then: Joi.string().email().required().label('Email'),
            otherwise: Joi.forbidden().label('Email')
        }),
        type: Joi.string()
            .valid('web', 'mobile')
            .required()
            .label('Type')
    });

    return schema.validate(data, { abortEarly: false });
};


export default {
    changePassword,
    resendEmail,
    sendTokenToUser,
    verifytoken,
    resetPassword,
};
