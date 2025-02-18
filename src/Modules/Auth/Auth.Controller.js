import User from "../User/UserModel";
import { checkExistByField, makeOTP, verifyHashPassword, sendMail } from "../../Helpers/Helper.js";
import createHttpError from "http-errors";
import OTP from "./OtpModel.js";
import jwt from 'jsonwebtoken';


async function register(req, res, next) {

    try {

        const { name, email, password, repeat_password } = req.body;

        if (password !== repeat_password) throw new createHttpError.BadRequest("Passwords do not match");
   
        const user = await User.create({ name, email, password });

        res.status(201).json({ data: user, message: 'User Registered Successfully' });
   
    } catch (e) {

        next(e);
    }
}


async function login(req, res, next) {

    try {

        const { email, password } = req.body;

        const user = await checkExistByField('email', email, 'users');

        if (!user) throw new createHttpError.NotFound("User Not Found");

        if (!await verifyHashPassword(user.password, password)) throw new createHttpError.Forbidden("Invalid Password");

        const token = jwt.sign({ email: user.email, slug: user.slug }, process.env.SECRET_KEY, { expiresIn: '1d' });

        return res.status(200).json({ message: 'Login successful', token });

    } catch (e) {
        next(e);
    }

}


async function sendOTP(req, res, next) {

    try {

        const { email } = req.body;

        const user = await checkExistByField('email', email, 'users');

        // Check if user exists
        if (!user) throw new createHttpError.NotFound('404 - User not found');

        // Check if user is already active
        if (user.email_verified_at) throw new createHttpError.BadRequest('User is already active');

        const otpRecord = await OTP.findOne({ where: { user_id: user.id } });

        const now = new Date().getTime();

        // Check OTP and expiration
        if (otpRecord && otpRecord.expires_in > now) {
            throw new createHttpError.BadRequest('An OTP code has already been sent to your email');
        }

        // Create OTP
        const otp_code = makeOTP();

        await OTP.create({ code: otp_code[0], expires_in: otp_code[1], user_id: user.id });

        // Send OTP via email
        const subject = 'Your OTP Code';
        const text = `Your OTP code is: ${otp_code[0]}. It will expire in 2 minutes.`;
        await sendMail(user.email, subject, text);

        res.status(200).json({ message: 'OTP sent successfully' });

    } catch (e) {
        next(e);
    }

}


async function checkOTP(req, res, next) {

    try {

        const { otp } = req.body;

        const otpRecord = await OTP.findOne({ where: { code: otp } });
        if (!otpRecord) throw new createHttpError.NotFound('OTP not found');

        // Check expiration
        const now = new Date().getTime();
        if (otpRecord.expires_in < now) throw new createHttpError.Forbidden('OTP has expired');

        // Activate user
        const user = await User.findByPk(otpRecord.user_id);
        user.email_verified_at = now;
        await user.save();

        res.status(200).json({ message: 'User is now active' });

    } catch (e) {
        next(e);
    }

}


export {
    register,
    login,
    checkOTP,
    sendOTP,
};
