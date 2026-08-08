const { validationResult } = require('express-validator');
const Response = require('../utils/response');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({ field: err.path, message: err.msg }));
    return Response.badRequest(res, 'Validation failed', extractedErrors);
  }
  next();
};

module.exports = validateRequest;