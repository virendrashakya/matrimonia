const { authenticate, requireVerified, requireRole, generateToken } = require('./auth');
const {
    validate,
    validateQuery,
    registerSchema,
    loginSchema,
    profileSchema,
    recognitionSchema,
    searchSchema
} = require('./validation');

module.exports = {
    authenticate,
    requireVerified,
    requireRole,
    generateToken,
    validate,
    validateQuery,
    registerSchema,
    loginSchema,
    profileSchema,
    recognitionSchema,
    searchSchema
};
