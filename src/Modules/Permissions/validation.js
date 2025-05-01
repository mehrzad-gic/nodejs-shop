import Joi from "joi";

const permissionSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
});

export { permissionSchema };