import createHttpError from "http-errors";
import {postgresQlClient} from "../../Configs/PostgresQl.js";
import { logError } from "../../Helpers/Helper.js";
import emailQueue from "../../Queues/EmailQueue.js";
import jwt from "jsonwebtoken";

//! @post /auth/login
async function loginService(req, res, next) {

    // validation
    const { input } = req.body;
    const inputType = checkInput(input);
    if(inputType == false) throw new createHttpError.BadRequest('Input must be a phone number or email')
    
    const client = await postgresQlClient();

    try {

        const user = await client.query(`SELECT id FROM users WHERE ${inputType}=$1`,[input]);

        if(user && user.rows.length > 0){

            // check user status
            if(user.rows.length > 0 &&user.rows[0].status == 0) throw new createHttpError.BadRequest('user is baned');
            
            // check if user otp is not expired
            const otp = await client.query("select * from otp where user_id=$1",[user.rows[0].id]);
        
            const isOtpNotExpired = otp.rows?.[0]?.expire_in > new Date();
            
            if(isOtpNotExpired) res.status(400).json({
                message: 'OTP is already sent to user',
                success: true,
            })

            // delete old otp if exist
            if(otp.rows.length > 0) await client.query("delete from otp where user_id=$1",[user.rows[0].id]);

            // create otp
            const { otpCode, otpExpireIn } = createOtp();
            await client.query("insert into otp (user_id, code, expire_in) values ($1, $2, $3)",[user.rows[0].id, otpCode, otpExpireIn]);
            
            // send otp to user
            await emailQueue.add('sendEmail',{
                to: user.rows[0].email || 'mehrzad20061384@gmail.com',
                subject: 'OTP',
                text: `Your OTP is ${otpCode}`
            });

            res.status(200).json({
                message: 'OTP sent to user',
                data: {
                    otp: otpCode
                },
                success: true
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
            setCookie({res, token,maxAge: 1 * 24 * 60 * 60 * 1000});

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

//! @post /auth/resend?email=$x
async function resendService(req, res, next) {

    const { email } = req.params;
    const client = await postgresQlClient()

    try { 

        // check user
        const user = await client.query("select id,email from users where email=$1",[email]);
        if(!user || user.rows.length == 0) next(createHttpError.NotFound('user not found'));

        // check otp
        const otp = await client.query("select id,user_id,expire_in from otp where user_id=$1",[user.rows[0].id]);
        if(otp && otp.rows[0].expire_in > new Date()) next(createHttpError.BadRequest('you have one unexpired otp'));

        // delete old otp
        await client.query('delete from otp where user_id=$1',[user.rows[0].id]);

        // create otp
        const {expire_in,otpCode} = createOtp();
        await client.query('insert into otp (expire_in,user_id,code,type) values($1,$2,$3,$4)',[
            expire_in,user.rows[0].id,otpCode,1
        ])

        res.status(200).json({
            message: "otp has sent successfully",
            success: true,
        })

    } catch(e){
        next(e)
    } finally {
        client.release();
    }
    
}

//! @post /auth/logout
function logoutService(req, res, next) {

    try{
        
        setCookie({res, token: '', maxAge:0});
        
        res.status(200).json({
            message: "user is logout",
            success: true,
        });

    } catch(e){
        next(e)
    }

}



//------------------------------------------- helper functions

function checkInput(input) {

    if (typeof input !== 'string' || input.trim() === '') {
        return false;
    }
    
    // Trim input for validation
    const trimmedInput = input.trim();
    
    // More comprehensive email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    // More strict phone regex (adjust based on your needs)
    const phoneRegex = /^\+?[\d\s\-\(\)]{6,}$/;
    
    if (emailRegex.test(trimmedInput)) {
        return "email";
    } else if (phoneRegex.test(trimmedInput) && trimmedInput.replace(/\D/g, '').length >= 6) {
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


function setCookie(value){

    const {res, token, maxAge} = value;
    
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
    checkInput,
    resendService,
    logoutService
}