import Joi from "joi";

export const productSellerValidation = Joi.object({
    price: Joi.number().required(),
    currency_code: Joi.string().pattern(new RegExp('^[A-Z]{3}$')).required(),
    branch_id: Joi.number().required(),
    description: Joi.string().required(),
    status: Joi.string().valid(0,1).required()
});


