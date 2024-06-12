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
    },
    debug: true
});


const sendMail = async (emails, topicId) => {
    // console.log(emails)
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emails,
        subject: `New Update on ${topicId}`,
        text: `Dear Subscriber,
        
We hope this message finds you well. We are excited to bring you the latest updates on your subscribed topic: ${topicId}.

New message is waiting for you!!!
        
Stay tuned for more information and insights on ${topicId} that we believe you'll find valuable and engaging.
        
Thank you for subscribing and being a valued member of our community.
        
Best regards,
The Notification Team`
    };

    try {
        // console.log("IN TRY")
        const info = await transporter.sendMail(mailOptions);
        // console.log("SUCCESS")
        console.log(info)
        return info;
    } catch (error) {
        // console.log("ERROR")
        console.log(error)
        throw error;
    }
};

export default sendMail;
