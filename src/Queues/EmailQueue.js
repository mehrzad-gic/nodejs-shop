import Queue from 'bull';
import redisClient from '../Configs/Redis.js';
import emailJob from '../Jobs/EmailJob.js'
import { logError, logInfo } from '../Helpers/Helper.js';

const emailQueue = new Queue('emailQueue', { redis: redisClient });

emailQueue.process('sendEmail', emailJob);

emailQueue.on('completed', (job, result) => {   
    logInfo(`Email job completed: ${job.id}`);   
});           

emailQueue.on("failed", (jobId, error) => {
    logError(`Email Job ${jobId?.id} failed with error: ${error}`);
});


export default emailQueue;
