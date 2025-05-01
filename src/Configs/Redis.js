import Redis from 'ioredis';
import logger from '../Helpers/Logger.js';


const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6381,
  maxRetriesPerRequest: 2
});

redisClient.on('connect', () => {
  logger.info(`Connected to Redis ${process.env.REDIS_PORT}`);
});

redisClient.on('error', (err) => {
  logger.error(`Redis connection ${process.env.REDIS_PORT} error: ${err.message}, Code: ${err.code}, Stack: ${err.stack}`);
});


export default redisClient;