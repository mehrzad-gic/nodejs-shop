import { Router } from "express";
import { login, verifyOtp } from "./Auth.Controller.js";
const authRoutes = Router();

authRoutes.post('/login',login)
authRoutes.post('/verify-otp',verifyOtp)
export default authRoutes;