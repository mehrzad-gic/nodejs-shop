
import createHttpError from "http-errors";
import  { query } from "../Configs/PostgresQl.js";
import { logError } from "../Helpers/Helper.js";

const DeleteChildJob = async (job) => {

    try {

        const { model,field,value } = job.data;

        await query(`DELETE FROM ${model} WHERE ${field}=$1`,[value]);

        return true;

    } catch (error) {
        logError(error)
        throw new createHttpError.InternalServerError(error.message);
    }
};

export default DeleteChildJob;
