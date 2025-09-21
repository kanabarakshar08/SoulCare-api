import 'dotenv/config';
import { emailApi } from './Configuration.js';

export const ResetEmail = async (type, token, to, name) => {
    return await emailApi.sendTransacEmail({
        sender: { name: 'Connester', email: process.env.BREVO_USER},
        to: [{ email: to, name}],
        subject: 'Email Reset Request',
        text: 'Follow the link to reset your Email.',
        htmlContent: await changeEmail(token, type, to, name)
    });
};

const changeEmail = (token, type, to, name) => {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Address Change</title>
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
        }
        .header-items {
            text-align: center;
            max-width: 80%;
            display: flex;
            justify-content: center;
            gap: 10px;
        }
        .header img {
            width: 150px;
            height: 60%;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .content h1 {
            color: #4a90e2 !important;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            margin-top: 20px;
            background-color: #4a90e2 !important;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            color: #888;
            padding: 20px;
            font-size: 14px;
        }
        .user-name {
            text-align: start;
            font-size: 20px;
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
                <h1>Email Address Change Request</h1>
                <p>We received a request to change the email address associated with your account.</p>
                <p>If you made this request, please click the button below to confirm and update your email address:</p>
               <a href="${process.env.BASE_LINK}/settings?filter=security&token=${token}&type=${type}&email=${to}" class="button">Reset Email</a>
                <p style="margin-top: 20px;"><strong>⚠️ This link is valid for 30 minutes only.</strong> If it expires, you'll need to initiate the request again.</p>
                <p>If you did not request this change, you can safely ignore this message — your email address will remain unchanged.</p>
            </div>
            <div class="footer">
                <p>Thank you,<br>The Connester Team</p>
                <p>If you need assistance, contact our support team at admin@gmail.com.</p>
                <p>&copy; 2024 Connester. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

export default ResetEmail
