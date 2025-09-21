
import 'dotenv/config';
import { emailApi } from './Configuration.js';
import { getAdminContactEmail } from '../../Helpers/Helper.js';

const ContactEmail = async (name,email,subject, message) => {
    try {
        const to = await getAdminContactEmail();
        const info = await emailApi.sendTransacEmail({
            sender: { name: 'Connester', email: process.env.BREVO_USER},
            to: [{ email: to, name}],
            subject: `${subject} from ${name}`,
            text: 'Hi',
            htmlContent: contactMail(name,email,subject, message),
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
const contactMail = (name,email,subject, message) => {
    return`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Form Submission</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
            margin: 0;
        }
        .container {
            max-width: 600px;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        h2 {
            color: #333;
            margin-bottom: 20px;
            font-size: 24px;
        }
        p {
            margin-bottom: 10px;
            line-height: 1.6;
            color: #555;
        }
        .message {
            white-space: pre-wrap;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #007bff;
            margin-bottom: 20px;
            border-radius: 5px;
        }
        .footer {
            font-size: 12px;
            color: #888;
            margin-top: 20px;
            text-align: center;
        }
        .highlight {
            font-weight: bold;
            color: #007bff;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Contact Form Submission</h2>
        <p><span class="highlight">Name:</span> ${name}</p>
        <p><span class="highlight">Email:</span> ${email}</p>
        <p><span class="highlight">Subject:</span> ${subject}</p>
        <p><span class="highlight">Message:</span></p>
        <p class="message">${message}</p>
        <p class="footer">This is an automated message. Please do not reply.</p>
    </div>
</body>
</html>
`;
};
export default ContactEmail
