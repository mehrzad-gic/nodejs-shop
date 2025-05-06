import Joi from "joi";

export const brandValidation = Joi.object({
    name: Joi.string().required(),
    translations: Joi.alternatives().try(
        Joi.object().pattern(Joi.string(), Joi.string()), // { en: "Hello" }
        Joi.string().json() // '{"en":"Hello"}'
    ).default({}),
    description: Joi.string().required(),
});