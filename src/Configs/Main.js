import express from 'express';
import swaggerConfig from './Swagger.js';
import Express from './Express.js';
import Errors from './Errors.js';
import Routes from './Routes.js';
const app = express();;

export default async function Main() {


    
    Express(app);

    Routes(app);

    swaggerConfig(app);

    // Associations();
    
    Errors(app);

    
}