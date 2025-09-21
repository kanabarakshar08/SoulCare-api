import 'dotenv/config';
import { emailApi } from './Configuration.js';

const WelcomeSendEmail = async (to, type, verifyToken, name) => {
    try {
        const info = await emailApi.sendTransacEmail({
            sender: { name: 'Connester', email: process.env.BREVO_USER},
            to: [{ email: to, name}],
            subject: 'Welcome to Connester🚀',
            text: 'Hi',
            htmlContent: welcomeMail(to, type, verifyToken, name),
        });

        return { success: true, message: 'Email sent successfully!', info };
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            success: false,
            message: 'Error sending email. Please try again.',
            error,
        };
    }
};

const welcomeMail = (to, type, verifyToken, name) => {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Connester</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9 !important;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff !important;
            padding: 20px;
            border-radius: 8px;
        }
        .header {
            width: 100%;
            padding: 20px;
            border-bottom: 1px solid gray;
             text-align: center;
            display: flex;
            justify-content: center;
        }
        .header-items {
            text-align: center;
            display: flex;
            justify-content: center;
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
            color: #4a90e2 !important;
            margin-bottom: 10px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            margin-top: 25px;
            background-color: #4a90e2 !important;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            font-size: 16px;
        }
        .footer {
            text-align: center;
            color: #888;
            padding: 20px;
            font-size: 14px;
        }
        .user-name {
            text-align: left;
            font-size: 18px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div style="box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            <div class="header">
                <div class="header-items">
                    <img src="https://res.cloudinary.com/dljeqd1ag/image/upload/v1750929355/Connester_c67fu9.jpg" alt="Connester Logo">
                </div>
            </div>
            <div class="content">
                <p class="user-name">Hi ${name},</p>
                <h1>Welcome to Connester! 🎉</h1>
                <p>We’re thrilled to have you join our community. Connester is built to help you connect, grow, and succeed.</p>
                <p>Before we get started, we need to verify your email address. Just click the button below to complete your registration:</p>
                <a href="${process.env.BASE_LINK}/login/?token=${verifyToken}&type=${type}&email=${to}" class="button">Verify My Email</a>
                <p style="margin-top: 20px;">Once verified, you’ll get full access to your dashboard and all the exciting features we offer.</p>
                <p>If you didn’t sign up for Connester, you can safely ignore this email.</p>
                <p style="margin-top: 30px;">Cheers,<br><strong>The Connester Team</strong></p>
            </div>
            <div class="footer">
                <p>Need help? Reach out to us at <a href="mailto:admin@gmail.com">admin@gmail.com</a>.</p>
                <p>&copy; 2024 Connester. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};
export default WelcomeSendEmail;
