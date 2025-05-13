import Joi from "joi";


const categoryOptionValidation = Joi.object({
    name: Joi.string().required(),
    status: Joi.number().valid(0, 1).required(),
    key: Joi.string().required(),
    value: Joi.number().valid(0, 1).required(),
});


export { categoryOptionValidation };
