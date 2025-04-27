import Redis from 'ioredis';
import logger from '../Helpers/Logger.js';


const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6380,
  maxRetriesPerRequest: 5
});

redisClient.on('connect', () => {
  logger.info('Connected to Redis');
});

redisClient.on('error', (err) => {
  logger.error(`Redis connection error: ${err.message}, Code: ${err.code}, Stack: ${err.stack}`);
});

redisClient.on('reconnecting', () => {
  logger.info('Reconnecting to Redis...');
});

export default redisClient;