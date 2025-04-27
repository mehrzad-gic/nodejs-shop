import dotenv from "dotenv";
dotenv.config();
import logger from "./Logger.js";


function logError(err){

    const env = process.env.NODE_ENV

    if(env == "development"){

        logger.error(err)
    }

}


export {
    logError
}