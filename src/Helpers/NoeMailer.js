import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail as the email service
    port : 465,
    secure: true,
    logger: true,
    debug: true,
    secureConnection : false,
    auth: {
        user: 'mehrzad20061384@gmail.com', // Your Gmail address
        pass: 'uwxitmkcqkjceiof', // Your Gmail password or app-specific password
    },
    tls: {
        rejectUnauthorized : true
    }
});

const sendMail = async (value) => {

    const {to, subject, text} = value;
    
    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to, // Recipient address
        subject, // Email subject
        text, // Email body
    };
    console.log('mailOptions: ',mailOptions);
    

    try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};




export {
    sendMail 
};