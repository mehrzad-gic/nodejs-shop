import createHttpError from "http-errors";

async function login(req,res,next){

    try {

        const {mobile} = req.body;
        if(!mobile) throw new createHttpError.BadRequest("user mobile is required")

        

    } catch(e){
        next(e)
    }

}