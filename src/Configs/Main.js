import express from 'express';
import swaggerConfig from './Swagger.js';
import connectToDatabase from './Sequelize.js'; // Adjust the path if necessary
import Express from './Express.js';
import Errors from './Errors.js';
import Routes from './Routes.js';
const app = express();
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables

export default async function Main() {

    // Connect to the database
    const sequelize = await connectToDatabase();

    // Middleware configurations
    Express(app);
    Routes(app);
    Errors(app);

    // Swagger configuration
    swaggerConfig(app);


    // Close the Sequelize connection when your application exits
    process.on('SIGINT', async () => {
        await sequelize.close();
        console.log('Database connection closed.');
        process.exit(0);
    });


}

