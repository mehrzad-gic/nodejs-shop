import Joi from "joi";


const workerValidation = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().required(),// user.slug
    address: Joi.string().required(),
    body_info: Joi.string().required(),
    description: Joi.string().required(),
    national_code: Joi.string().required(),
    city: Joi.string().required(),
    status: Joi.string().valid(...Object.values(status)).optional(),    
})

const workerUpdateValidation = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    description: Joi.string().required(),
    slug_input: Joi.string().required(),
    status: Joi.string().valid(...Object.values(status)).optional(),
})


// enums
const status = {
    ACTIVE: "active",
    BLOCKED: "blocked",
    PENDING: "pending",
}

export { workerValidation, workerUpdateValidation, status };
