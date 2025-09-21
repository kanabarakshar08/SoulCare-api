import { Router } from 'express';
import AuthController from './AuthController.js';
import Authentication from '../../Middleware/AuthMiddleware.js';
import PasswordController from './PasswordController.js';

const route = Router();

route.post('/signup', AuthController.register);
route.post('/login', AuthController.login);
route.get('/logout', Authentication, AuthController.logout);
route.post("/resend-email", AuthController.resendEmail);

route.post('/user-verification', AuthController.verifyUserAccount)
route.get('/logout-all-device', Authentication, AuthController.logoutAllDevice);
route.post('/change-password', Authentication, PasswordController.changePassword);

route.post('/forget-password/check-user', PasswordController.sendTokenToUser);
route.post('/forget-password/verify-token', PasswordController.verifytoken);
route.post('/forget-password/set-password', PasswordController.resetPassword);
route.post("/forget-password/resend-email", PasswordController.resendEmail);

route.get('/me', Authentication, AuthController.checkUserIsAuthenticate);
route.get('/user-pages', Authentication, AuthController.userPages);


export default route;
