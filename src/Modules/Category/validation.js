import Joi from "joi";

export const categoryValidation = Joi.object({
    name: Joi.string().required(),
    translations: Joi.alternatives().try(
        Joi.object().pattern(Joi.string(), Joi.string()), // { en: "Hello" }
        Joi.string().json() // '{"en":"Hello"}'
    ).default({}),
    status: Joi.number().required().valid(0, 1),
    icon: Joi.string().required(),
});
