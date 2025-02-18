import express from 'express';
import swaggerConfig from './Swagger.js';
import connectToDatabase from './DB.js'; // Adjust the path if necessary
import Express from './Express.js';
import Errors from './Errors.js';
import Routes from './Routes.js';
const app = express();

export default async function Main() {

    // Connect to the database
    const sequelize = await connectToDatabase();

    // Middleware configurations
    Express(app);
    Routes(app);
    Errors(app);

    // Swagger configuration
    swaggerConfig(app);

}

