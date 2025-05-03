import Joi from "joi";

const userAddressSchema = Joi.object({
    address: Joi.string().required(),
    city_id: Joi.string().required(),
    place_id: Joi.string().required(),
    postal_code: Joi.string().required(),
    floor: Joi.string().optional(),
    street: Joi.string().optional(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
});

export { userAddressSchema };