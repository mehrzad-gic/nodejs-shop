import Joi from "joi";


const categoryOptionValueValidation = Joi.object({
    name: Joi.string().required(),
    status: Joi.number().valid(0, 1).required(),
});


export { categoryOptionValueValidation };
