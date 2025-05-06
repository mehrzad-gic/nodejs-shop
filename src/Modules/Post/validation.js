import Joi from "joi";

export const postValidation = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    status: Joi.number().required(),
});


export { postValidation };