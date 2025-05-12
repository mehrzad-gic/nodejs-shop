import Joi from "joi";
import { status as statusType } from "../Seller/validation.js";

const branchValidation = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    address: Joi.string().required(),
    status: Joi.string().valid(...Object.values(statusType)).optional(),
    country_id: Joi.number().required(),
    province_id: Joi.number().required(),
    city_id: Joi.number().required(),
    zip_code: Joi.string().required(),
    seller_id: Joi.number().required(),
});


const registerValidation = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    address: Joi.string().required(),
    country_id: Joi.number().required(),
    province_id: Joi.number().required(),
    city_id: Joi.number().required(),
});

export { branchValidation, registerValidation };