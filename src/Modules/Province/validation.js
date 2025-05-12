import Joi from "joi";

export const validateProvince = Joi.object({
    name: Joi.string().required(),
    country_id: Joi.number().required(),
    status: Joi.number().required().valid(0, 1),
    code: Joi.string().required(),
    longitude: Joi.number().required(),
    latitude: Joi.number().required(),
});
