import Queue from 'bull';
import redisClient from '../Configs/Redis.js';
import createHttpError from 'http-errors';
import {deleteFile,uploadFile} from '../Jobs/UploadJob.js';
import logger from '../Helpers/Logger.js';


const UploadQueue = new Queue('upload',redisClient);

// Process the queue with named processors

UploadQueue.process('uploadFile', uploadFile);
UploadQueue.process('deleteFile', deleteFile);

UploadQueue.on('completed', async (job, result) => {
    try {
        logger.info(`Job with ID ${job.id} completed successfully.`);
    } catch (error) {
        logger.error(error);
        throw new createHttpError.InternalServerError(`Error updating post after upload: ${error.message}`);
    }
});


export default UploadQueue;