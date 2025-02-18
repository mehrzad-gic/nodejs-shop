import express from 'express';
import swaggerConfig from './Swagger.js';
import SequelizeConfig from './Sequelize.js'; // Adjust the path if necessary
import Express from './Express.js';
import Errors from './Errors.js';
import Routes from './Routes.js';
const app = express();
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables

export default async function Main() {

    const sequelize = await SequelizeConfig();

    Express(app);

    Routes(app);

    swaggerConfig(app);

    Errors(app);

    process.on('SIGINT', async () => {
        await sequelize.close();
        console.log('Database connection closed.');
        process.exit(0);
    });

}

