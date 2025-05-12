import Joi from "joi";
import { status as statusType } from "../Seller/validation.js";

const daysType = {
    SUNDAY: "Sunday",
    MONDAY: "Monday",
    TUESDAY: "Tuesday",
    WEDNESDAY: "Wednesday",
    THURSDAY: "Thursday",
    FRIDAY: "Friday",
    SATURDAY: "Saturday",
};


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


const scheduleValidation = Joi.object({
    open_days: Joi.array()
    .items(Joi.string().valid(...validDays))
    .required()
    .default(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
    opening_time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .default('09:00'),
    closing_time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .default('17:00'),
    weekend_opening_time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .default('09:00'),
    weekend_closing_time: Joi.string()
    .pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .default('17:00'),
});

export { branchValidation, registerValidation, scheduleValidation, daysType };