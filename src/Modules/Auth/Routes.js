import { Router } from "express";
const authRoutes = Router();

authRoutes.get('/test',(req,res) => {
    res.send('test');
})

export default authRoutes;