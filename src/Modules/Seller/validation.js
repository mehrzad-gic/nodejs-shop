import Joi from "joi";


const sellerValidation = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().required(),// user.slug
    description: Joi.string().required(),
    status: Joi.string().valid(...Object.values(status)).optional(),    
});


const registerValidation = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
});


// enums
const status = {
    ACTIVE: "active",
    BLOCKED: "blocked",
    PENDING: "pending",
}

export { sellerValidation, status };
