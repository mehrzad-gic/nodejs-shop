import Joi from "joi";


const roleSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required()
});

export { roleSchema };