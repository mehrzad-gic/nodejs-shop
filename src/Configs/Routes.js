import express from 'express';
import Logger from '../Helpers/Logger.js';
import authRoutes from '../Modules/Auth/Routes.js';
import redisClient from './Redis.js';
import { query } from './PostgresQl.js';
import { logError } from '../Helpers/Helper.js';


function Routes(app) {

  app.use(express.json());

  app.get('/', (req, res) => {
    res.send("Hello NodeJS");
  });

  app.get('/test-redis', async (req, res) => {

    try {
      // Set a key-value pair
      await redisClient.set('testKey', 'Hello from Redis!');
      // Get the value
      const value = await redisClient.get('testKey');
      res.json({ message: 'Redis test successful', value });
    } catch (err) {
      res.status(500).json({ error: 'Redis operation failed', details: err.message });
    }
  })

  app.get('/test-pg', async (req, res, next) => {

    try {

      const result = await query('SELECT NOW() AS current_time');
      res.json({ message: 'PostgreSQL test successful', data: result, status: 'success3442',test: 'test' });

    } catch (e) {
      logError(e);
      next(e);
    }

  });

  // auth
  app.use('/auth', authRoutes);


  const PORT = process.env.APP_PORT || 5000;
  app.listen(PORT, () => {
    Logger.info(`Server is running on http://localhost:${PORT}`);
  });

}

export default Routes;