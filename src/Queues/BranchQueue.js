import Queue from 'bull';
import redisClient from '../Configs/Redis.js';
import { closeBranch } from '../Jobs/BranchJob.js';

const branchQueue = new Queue('branchQueue', { redis: redisClient });

branchQueue.process('closeBranch', closeBranch);

export default branchQueue;