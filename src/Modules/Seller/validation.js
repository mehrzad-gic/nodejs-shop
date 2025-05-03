import Joi from "joi";


const sellerValidation = Joi.object({
    name: Joi.string().required(),
    username: Joi.string().required(),// user.slug
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    address: Joi.string().required(),
    image: Joi.string().optional(),
    images: Joi.string().optional(),
    description: Joi.string().required(),
    status: Joi.string().valid(...Object.values(status)).optional(),    
})


// enums
const status = {
    ACTIVE: "active",
    BLOCKED: "blocked",
    PENDING: "pending",
}

export { sellerValidation, status };
