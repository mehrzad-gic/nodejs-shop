import { query } from '../Configs/PostgresQl.js';

async function closeBranch(job, done){

    const { branch_id } = job.data;

    const branch = await query("update branches set open = $1 where id = $2", [2,branch_id]);

    if(branch.rowCount === 0) return done(new Error("Branch not found"));

    done();
}

export { closeBranch };