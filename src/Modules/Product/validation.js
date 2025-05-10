import Joi from "joi";

export const productValidation = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    maximum_discount: Joi.number().required(),
    status: Joi.number().valid(0, 1).required(),
    category_id: Joi.number().required(),
    brand_id: Joi.number().required(),
});