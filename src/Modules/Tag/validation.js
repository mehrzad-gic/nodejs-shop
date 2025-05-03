import Joi from "joi";

export const tagValidation = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    translations: Joi.alternatives().try(
        Joi.object().pattern(Joi.string(), Joi.string()), // { en: "Hello" }
        Joi.string().json() // '{"en":"Hello"}'
    ).default({}),
});
