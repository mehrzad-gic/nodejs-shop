
async function register(req,res,next){

    try{

        const {name,email,password,repeat_password} = req.body;

    } catch(e){
        next(e)
    }

}


async function login(req,res,next){

    try{

        const {email,password} = req.body;


    } catch(e){
        next(e)
    }

}


async function sendOTP(req,res,next){

    try{


    } catch(e){
        next(e)
    }

}


async function checkOTP(req,res,next){

    try{


    } catch(e){
        next(e)
    }

}

