import express from 'express';
import Logger from '../Helpers/Logger.js';
import authRoutes from '../Modules/Auth/Routes.js';

function Routes(app) {

    app.use(express.json());

    app.get('/', (req, res) => {
        res.send("Hello NodeJS");
    });

    // auth
    app.use('/auth', authRoutes);

    
    const PORT = process.env.APP_PORT || 5000;
    app.listen(PORT, () => {
        Logger.info(`Server is running on http://localhost:${PORT}`);
    });

}

export default Routes;