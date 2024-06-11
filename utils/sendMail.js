import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: { 
        rejectUnauthorized: false
    }
});


const sendMail = async (emails, topicId) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emails,
        subject: `New Update on ${topicId}`,
        text: `Dear Subscriber,
        
We hope this message finds you well. We are excited to bring you the latest updates on your subscribed topic: ${topicId}.
        
Stay tuned for more information and insights on ${topicId} that we believe you'll find valuable and engaging.
        
Thank you for subscribing and being a valued member of our community.
        
Best regards,
The Notification Team`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        throw error;
    }
};

export default sendMail;
