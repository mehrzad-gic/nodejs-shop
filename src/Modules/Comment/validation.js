import Joi from "joi";

const commentValidation = Joi.object({
    text: Joi.string().min(1).max(1000).required(),
});

export { commentValidation };