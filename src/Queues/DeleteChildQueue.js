import Queue from 'bull';
import redisClient from "../Configs/Redis.js";
import DeleteChildJob from "../Jobs/DeleteChildJob.js";
import logger from '../Helpers/Logger.js';

const deleteChildQueue = new Queue("deleteChild", redisClient);

deleteChildQueue.process('deleteChild', DeleteChildJob);

deleteChildQueue.on("completed", (jobId, result) => {
    logger.info(`Job ${jobId} completed successfully with result: ${result}`);
});

deleteChildQueue.on("failed", (jobId, error) => {
    logger.error(`Job ${jobId} failed with error: ${error}`);
});

export default deleteChildQueue;
