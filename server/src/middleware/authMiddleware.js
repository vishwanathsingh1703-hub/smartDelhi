const JWTUtils = require('../utils/jwt');
const Response = require('../utils/response');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.unauthorized(res, 'Access token missing or malformed');
    }

    const token = authHeader.split(' ')[1];
    const decoded = JWTUtils.verifyAccessToken(token);

    req.user = decoded;
    next();
  } catch (error) {
    return Response.unauthorized(res, 'Invalid or expired access token');
  }
};

module.exports = authMiddleware;