import createHttpError from "http-errors";
import {postgresQlClient} from "../../Configs/PostgresQl.js";
import { logError } from "../../Helpers/Helper.js";


function checkInput(input) {

    // Regex for email validation (supports most common formats)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Regex for phone validation (supports international formats)
    const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
    
    if (emailRegex.test(input)) {
        return "email";
    } else if (phoneRegex.test(input)) {
        return "phone";
    } else {
        return false;
    }

}



async function loginService(req, res, next) {

    try {

        // validation
        const { input } = req.body;
        const inputType = checkInput(input);
        if(inputType == false) throw new createHttpError.BadRequest('Input must be a phone number or email')
        
        const client = await postgresQlClient();

        try {

            const user = await client.query(`SELECT id FROM users WHERE ${inputType}=$1`,[input]);

            if(user){

                // check user status
                if(user.status == 0) throw new createHttpError.BadRequest('user is baned');
                
                

            } else {

                // create account

            }

        } catch(e){
            logError(e)
            next(e)
        } finally {
            client.release()
        }
        

    } catch (e) {
    next(e)
    }

}

export {
    loginService,
    checkInput
}