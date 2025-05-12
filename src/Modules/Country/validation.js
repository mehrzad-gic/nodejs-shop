import Joi from "joi";

export const validateCountry = Joi.object({
    name: Joi.string().required(),
    status: Joi.string().required().valid(0, 1),
    iso_code_alpha2: Joi.string().min(2).max(2).required(),
    iso_code_alpha3: Joi.string().min(3).max(3).required(),
    capital: Joi.string().required(),
    currency_code: Joi.string().required(),
    longitude: Joi.number().required(),
    latitude: Joi.number().required(),
    flag: Joi.string().required(),
});


