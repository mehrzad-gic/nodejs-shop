import Joi from "joi";


const daysType = {
    SUNDAY: "Sunday",
    MONDAY: "Monday",
    TUESDAY: "Tuesday",
    WEDNESDAY: "Wednesday",
    THURSDAY: "Thursday",
    FRIDAY: "Friday",
    SATURDAY: "Saturday",
};


const scheduleValidation = Joi.object({
    open_days: Joi.array()
    .items(Joi.string().valid(...Object.values(daysType)))
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

export { scheduleValidation, daysType };