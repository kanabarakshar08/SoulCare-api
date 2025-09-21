import 'dotenv/config';

const WelcomeSendEmail = async (to, type, verifyToken, name) => {
    try {
        const info = await mailConfiguration.sendMail({
            from: `"SoulCare" <${process.env.EMAIL_AUTH_USER}>`,
            to: to,
            subject: 'Welcome to SoulCare 🌿',
            text: 'Hi',
            html: welcomeMail(to, type, verifyToken, name),
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
    <title>Welcome to SoulCare</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f8f9 !important;
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
            border-bottom: 1px solid #ddd;
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
            color: #3c9d9b !important;
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
            background-color: #3c9d9b !important;
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
                    <img src="https://your-soulcare-logo-url.com/logo.png" alt="SoulCare Logo">
                </div>
            </div>
            <div class="content">
                <p class="user-name">Hi ${name},</p>
                <h1>Welcome to SoulCare! 🌿</h1>
                <p>We’re grateful to have you join our wellness community. SoulCare is here to help you heal, grow, and find balance in life.</p>
                <p>Before we begin, please verify your email address by clicking the button below:</p>
                <a href="${process.env.BASE_LINK}/login/?token=${verifyToken}&type=${type}&email=${to}" class="button">Verify My Email</a>
                <p style="margin-top: 20px;">Once verified, you’ll unlock full access to your dashboard and all the supportive features we offer.</p>
                <p>If you didn’t sign up for SoulCare, you can safely ignore this email.</p>
                <p style="margin-top: 30px;">Warm regards,<br><strong>The SoulCare Team</strong></p>
            </div>
            <div class="footer">
                <p>Need help? Reach out to us at <a href="mailto:admin@soulcare.com">admin@soulcare.com</a>.</p>
                <p>&copy; 2025 SoulCare. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

export default WelcomeSendEmail;
