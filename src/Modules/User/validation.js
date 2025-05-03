import Joi from "joi";

const userSchema = Joi.object({
    password: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
});

const updateUserSchema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    phone: Joi.string().required(),
});


export { userSchema, updateUserSchema };

