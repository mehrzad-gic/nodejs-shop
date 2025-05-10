import Joi from "joi";

export const amazingSellValidation = Joi.object({
    name: Joi.string().required(),
    product_id: Joi.number().required(),
    type: Joi.string().required().valid("percentage", "number"),
    value: Joi.number().required(),
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
    maximum: Joi.number().required(),
    status: Joi.number().required().valid(0, 1),
});