import Queue from 'bull';
import redisClient from '../Configs/Redis.js';

const emailQueue = new Queue('emailQueue', { redis: redisClient });

emailQueue.process(await import('../Jobs/EmailJob.js'));

export default emailQueue;
