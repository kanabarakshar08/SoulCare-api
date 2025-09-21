import 'dotenv/config';
import { emailApi } from './Configuration.js';

export const ResetPassword = async (type, token, to, name) => {
    return await emailApi.sendTransacEmail({
        sender: { name: 'Connester', email: process.env.BREVO_USER},
        to: [{ email: to, name}],
        subject: 'Password Reset Request',
        text: 'Follow the link to reset your password.',
        htmlContent: ResetPasswordEmail(token, type, to, name)
    });
};

const ResetPasswordEmail = (token, type, to, name) => {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Reset Your Password - Connester</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
        }
        .header {
            padding: 20px;
            border-bottom: 1px solid #ccc;
            text-align: center;
        }
        .header img {
            width: 150px;
            height: auto;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .content h1 {
            color: #4a90e2;
            margin-bottom: 16px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            margin-top: 24px;
            padding: 12px 24px;
            background-color: #4a90e2;
            color: #fff;
            text-decoration: none;
            font-weight: bold;
            border-radius: 5px;
            font-size: 16px;
        }
        .footer {
            padding: 20px;
            text-align: center;
            color: #888;
            font-size: 14px;
        }
        .user-name {
            text-align: left;
            font-size: 18px;
            margin-bottom: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div style="box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);">
            <div class="header">
                <img src="https://res.cloudinary.com/dljeqd1ag/image/upload/v1750929355/Connester_c67fu9.jpg" alt="Connester Logo"/>
            </div>
            <div class="content">
                <p class="user-name">Hi ${name},</p>
                <h1>Password Reset Request</h1>
                <p>We received a request to reset the password associated with your Connester account.</p>
                <p>If you initiated this request, click the button below to set a new password:</p>
                <a href="${process.env.BASE_LINK}/new-password/?token=${token}&type=${type}&email=${to}" class="button">Reset My Password</a>
                <p style="margin-top: 24px;">⚠️ <strong>Note:</strong> This link will expire in 30 minutes for your security.</p>
                <p>If you didn’t request this change, you can safely ignore this email. No changes will be made unless you click the reset link above.</p>
            </div>
            <div class="footer">
                <p>Need help? Contact our support team at <a href="mailto:admin@gmail.com">admin@gmail.com</a>.</p>
                <p>&copy; 2024 Connester. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};
export default ResetPassword
