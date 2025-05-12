import Joi from "joi";

export const validateCity = Joi.object({
    name: Joi.string().required(),
    province_id: Joi.number().required(),
    status: Joi.number().required(),
    is_capital: Joi.number().required(),
    longitude: Joi.number().required(),
    latitude: Joi.number().required(),
});