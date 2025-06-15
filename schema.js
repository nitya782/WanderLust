const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
          filename: Joi.string().allow('', null),
          url: Joi.string().uri().allow('', null)
    }).optional()
    }).required()
});

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().min(1).max(5).required().messages({
      'number.base': 'Rating must be a number.',
      'number.min': 'Rating must be at least 1.',
      'number.max': 'Rating cannot be more than 5.',
      'any.required': 'Rating is required.'
    }),
    comment: Joi.string().required().messages({
      'string.empty': 'Comment cannot be empty.',
      'any.required': 'Comment is required.'
    })
  }).required()
});
