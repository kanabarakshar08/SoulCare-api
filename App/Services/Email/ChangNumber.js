import 'dotenv/config';
import { emailApi } from './Configuration.js';

export const ChangeMobileOTP = async (token, to, name) => {
  try {
    return await emailApi.sendTransacEmail({
      sender: { name: 'Connester', email: process.env.BREVO_USER},
      to: [{ email: to, name}],
      subject: 'Mobile Number Change Verification',
      text: `Use this OTP to verify your new mobile number: ${token}`,
      htmlContent: generateMobileChangeMail(token, to, name),
    });
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, message: 'Error sending OTP email. Please try again.', error };
  }
};

const generateMobileChangeMail = (token, to, name) => {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify Your Mobile Number</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f9;
      color: #333;
      margin: 0; padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #fff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid #e0e0e0;
    }
    .header img {
      width: 150px;
      height: auto;
    }
    .content {
      padding: 30px 20px;
      text-align: center;
    }
    .content h1 {
      color: #4a90e2;
      margin-bottom: 16px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .otp-code {
      display: inline-block;
      font-size: 24px;
      letter-spacing: 4px;
      background: #f0f8ff;
      padding: 12px 20px;
      border-radius: 6px;
      font-weight: bold;
      margin-bottom: 24px;
    }
    .footer {
      background: #fafafa;
      padding: 20px;
      text-align: center;
      color: #888;
      font-size: 14px;
    }
    .footer a {
      color: #4a90e2;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://res.cloudinary.com/dljeqd1ag/image/upload/v1750929355/Connester_c67fu9.jpg" alt="Connester Logo" />
    </div>
    <div class="content">
      <p>Hi ${name},</p>
      <h1>Verify Your New Mobile Number</h1>
      <p>We received a request to change the mobile number on your Connester account (${to}).</p>
      <p>Please use the following OTP to confirm your new number. This code is valid for 10 minutes only.</p>
      <div class="otp-code">${token}</div>
      <p>If you did not request this change, you can safely ignore this email—no changes will be made.</p>
      <p>Thanks for keeping your account secure! 🙌</p>
    </div>
    <div class="footer">
      <p>Need help? Contact us at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a>.</p>
      <p>&copy; 2024 Connester. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};

export default ChangeMobileOTP;
