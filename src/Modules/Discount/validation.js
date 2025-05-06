import Joi from "joi";

export const discountValidation = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    value: Joi.number().required(),
    status: Joi.number().required().valid(0, 1),
    start_date: Joi.date().required(),
    end_date: Joi.date().required(),
    maximum: Joi.number().required(),
    type: Joi.string().required().valid("percentage", "number"),
    user_id: Joi.number().optional(),
});