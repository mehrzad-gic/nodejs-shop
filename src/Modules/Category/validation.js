import Joi from "joi";

export const categoryValidation = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
});
