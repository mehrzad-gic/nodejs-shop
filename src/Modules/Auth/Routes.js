import { Router } from "express";
import { login, verifyOtp, resend, logout } from "./Auth.Controller.js";
const authRoutes = Router();

authRoutes.post('/login',login)
authRoutes.post('/verify-otp',verifyOtp)
authRoutes.post('/resend',resend)
authRoutes.post('/logout',logout)

export default authRoutes;