const Response = require('../utils/response');

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return Response.forbidden(res, 'Access denied: Insufficient privileges for this role');
    }
    next();
  };
};

module.exports = roleMiddleware;