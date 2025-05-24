import { loginService, verifyOtpService, logoutService, resendService } from "./Auth.Service.js"

//! @post /auth/login
async function login(req, res, next) {
   await loginService(req, res, next)
}

//! @post /auth/verify-otp
async function verifyOtp(req, res, next) {
    await verifyOtpService(req, req, next)
}

//! @post /auth/verify-otp
async function resend(req, res, next) {
    resendService(req, req, next)
}

//! @post /auth/verify-otp
function logout(req, res, next) {
    logoutService(req, req, next)
}


export {
    login,
    verifyOtp,
    resend,
    logout
}