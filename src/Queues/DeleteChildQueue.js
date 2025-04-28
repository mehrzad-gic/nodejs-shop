import Queue from 'bull';
import redisClient from "../Configs/Redis.js";
import DeleteChildJob from "../Jobs/DeleteChild.Job.js";

const deleteChildQueue = new Queue("deleteChild", redisClient);

deleteChildQueue.process(DeleteChildJob);

deleteChildQueue.on("completed", (jobId, result) => {
    console.log(`Job ${jobId} completed successfully with result: ${result}`);
});

deleteChildQueue.on("failed", (jobId, error) => {
    console.error(`Job ${jobId} failed with error: ${error}`);
});

export default deleteChildQueue;
