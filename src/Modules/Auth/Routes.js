import { Router } from "express";
import { login } from "./Auth.Controller.js";
const authRoutes = Router();

authRoutes.post('/login',login)

export default authRoutes;