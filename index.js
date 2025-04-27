import path from 'path'
import dotenv from 'dotenv';
dotenv.config({
    path: path.resolve('/.env') // Adjust path as needed
});
import Main from "./src/Configs/Main.js";
Main()