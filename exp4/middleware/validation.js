const Joi = require('joi');

// Security Principle 2: Fail-Safe Defaults
// Input Validation Schema
const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    role: Joi.string().valid('guest', 'customer', 'editor', 'admin').default('guest')
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            // Security Principle 2: Fail-Safe Defaults 
            return res.status(400).render('error', {
                message: 'Validation Error: ' + error.details[0].message,
                error: {}
            });
        }
        next();
    };
};

module.exports = {
    registerSchema,
    loginSchema,
    validateRequest
};
