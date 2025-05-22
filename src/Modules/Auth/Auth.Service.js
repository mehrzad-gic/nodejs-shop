import createHttpError from "http-errors";
import {postgresQlClient} from "../../Configs/PostgresQl.js";
import { logError } from "../../Helpers/Helper.js";
import emailQueue from "../../Queues/EmailQueue.js";
import jwt from "jsonwebtoken";


// services
async function loginService(req, res, next) {

    try {

        // validation
        const { input } = req.body;
        const inputType = checkInput(input);
        if(inputType == false) throw new createHttpError.BadRequest('Input must be a phone number or email')
        
        const client = await postgresQlClient();

        try {

            const user = await client.query(`SELECT id FROM users WHERE ${inputType}=$1`,[input]);

            if(user){

                // check user status
                if(user.rows.length > 0 &&user.rows[0].status == 0) throw new createHttpError.BadRequest('user is baned');
                
                // check if user otp is not expired
                const otp = await client.query("select * from otp where user_id=$1",[user.rows[0].id]);
                if(otp.rows.length > 0){
                    if(otp.rows[0].expire_in < new Date()) next(new createHttpError.BadRequest('otp is not expired yet'));
                }

                // create otp
                const { otpCode, otpExpireIn } = createOtp();
                await client.query("insert into otp (user_id, code, expire_in) values ($1, $2, $3)",[user.rows[0].id, otpCode, otpExpireIn]);
                
                // send otp to user
                await emailQueue.add('sendEmail',{
                    to: user.rows[0].email,
                    subject: 'OTP',
                    text: `Your OTP is ${otpCode}`
                });

                // delete old otp if exist
                if(otp.rows.length > 0) await client.query("delete from otp where user_id=$1",[user.rows[0].id]);

                res.status(200).json({
                    message: 'OTP sent to user',
                    data: {
                        otp: otpCode
                    }
                });

            } else {

                // create account
                const user = await client.query("insert into users (email, ip) values ($1, $2) returning id",[input, req.ip]);

                // create otp
                const { otpCode, otpExpireIn } = createOtp();
                await client.query("insert into otp (user_id, code, expire_in) values ($1, $2, $3)",[user.rows[0].id, otpCode, otpExpireIn]);

                // send otp to user
                await emailQueue.add('sendEmail',{
                    to: input,
                    subject: 'OTP',
                    text: `Your OTP is ${otpCode}`
                });

                res.status(200).json({
                    message: 'Account created',
                    data: {
                        email: input
                    },
                    success: true
                });

            }

        } catch(e){
            logError(e)
            next(e)
        } finally {
            client.release()
        }
        

    } catch (e) {
        next(e)
    }

}

//! @post /auth/verify-otp
async function verifyOtpService(req, res, next) {

    try {

        const { otp } = req.body;
        const client = await postgresQlClient();

        try {

            // check if otp is valid
            const otpData = await client.query("select * from otp where code=$1",[otp]);

            if(otpData.rows.length == 0) throw new createHttpError.BadRequest('otp is not valid');

            if(otpData.rows[0].expire_in < new Date()) throw new createHttpError.BadRequest('otp is expired');
            
            // check if user is valid
            const user = await client.query("select * from users where id=$1",[otpData.rows[0].user_id]);
            if(user.rows.length == 0) throw new createHttpError.BadRequest('user is not valid');

            // check if user is active
            if(user.rows[0].status == 0) throw new createHttpError.BadRequest('user is not active');
        
            // login user
            const token = makeToken({
                id: user.rows[0].id,
                email: user.rows[0].email,
                phone: user.rows[0].phone,
                name: user.rows[0].name,
                ip: user.rows[0].ip,
                image: user.rows[0].image,
                status: user.rows[0].status,
                created_at: user.rows[0].created_at,
                updated_at: user.rows[0].updated_at,
                deleted_at: user.rows[0].deleted_at
            });

            // set http-only cookie for 1 day
            setCookie(res, token, 1 * 24 * 60 * 60 * 1000);

            res.status(200).json({
                message: 'User logged in',
                success: true,
            });

        } catch (e) {
            logError(e)
            next(e)
        } finally {
            client.release()
        }
    
    } catch (e) {
        next(e)
    }

}



// helper functions
function checkInput(input) {

    // Regex for email validation (supports most common formats)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Regex for phone validation (supports international formats)
    const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
    
    if (emailRegex.test(input)) {
        return "email";
    } else if (phoneRegex.test(input)) {
        return "phone";
    } else {
        return false;
    }

}

function createOtp(){

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpireIn = new Date(new Date().getTime() + 2 * 60 * 1000);

    return {
        otpCode,
        otpExpireIn
    }
}

function makeToken(data){
    const token = jwt.sign(data, process.env.SECRET_KEY, { expiresIn: '1h' });
    return token;
}


function setCookie(res, token, maxAge){

    // set http-only cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: maxAge || 1 * 24 * 60 * 60 * 1000,
        sameSite: 'strict'
    });

}


export {
    loginService,
    verifyOtpService,
    checkInput
}