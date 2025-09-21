import jwt from 'jsonwebtoken';
import User from '../Models/User.js';
import { ROLES } from '../utils/Enum.js';

 const Authentication = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        const session = await Session.findOne({ 
            user_id: decoded.userId, 
            token: token 
        });

        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or session expired.'
            });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found.'
            });
        }

        req.userId = user._id;
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

export const adminAuth = (req, res, next) => {
    if (req.user?.is_admin !== true) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

export const doctorAuth = (req, res, next) => {
    if (req.user?.is_admin !== true && req.user?.role !== ROLES.DOCTOR) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Doctor or admin privileges required.'
        });
    }
    next();
};

export const patientAuth = (req, res, next) => {
    if (req.user?.role !== ROLES.PATIENT && req.user?.is_admin !== true) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Patient privileges required.'
        });
    }
    next();
};

export default Authentication;