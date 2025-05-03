import Queue from 'bull';
import redisClient from '../Configs/Redis.js';
import emailJob from '../Jobs/EmailJob.js'

const emailQueue = new Queue('emailQueue', { redis: redisClient });

emailQueue.process('sendEmail',emailJob);

export default emailQueue;
