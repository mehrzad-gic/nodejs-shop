import { loginService, verifyOtpService } from "./Auth.Service.js"

//! @post /auth/login
async function login(req, res, next) {

    loginService(req, req, next)

}

//! @post /auth/verify-otp
async function verifyOtp(req, res, next) {

    verifyOtpService(req, req, next)

}

export {
    login,
    verifyOtp
}