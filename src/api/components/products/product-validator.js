const { Joi } = require('celebrate');

module.exports = {
  createProduct: {
    body: Joi.object().keys({
      name: Joi.string().required(),
      description: Joi.string().required(),
      price: Joi.number().required(),
      origin: Joi.string().required(),
    }),
  },
  updateProduct: {
    body: Joi.object({
      name: Joi.string(),
      description: Joi.string(),
      price: Joi.number(),
      origin: Joi.string(),
    }),
    params: Joi.object({
      id: Joi.string().required(),
    }),
  },
};
