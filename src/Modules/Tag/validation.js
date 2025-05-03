import Joi from "joi";

export const tagValidation = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
});
