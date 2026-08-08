const AuthService = require('../services/authService');
const Response = require('../utils/response');

class AuthController {
  static async register(req, res, next) {
    try {
      const { name, email, phone, ward, password, role } = req.body;
      const result = await AuthService.register({ name, email, phone, ward, password, role });
      return Response.created(res, 'User registered successfully', result);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await AuthService.login({ email, password });

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return Response.success(res, 'Login successful', {
        user,
        token: accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });
      return Response.success(res, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  static async profile(req, res, next) {
    try {
      const user = await AuthService.getProfile(req.user.id);
      return Response.success(res, 'Profile retrieved successfully', user);
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req, res, next) {
    try {
      const token = req.cookies.refreshToken;
      if (!token) {
        return Response.unauthorized(res, 'Refresh token not found');
      }
      const { accessToken, user } = await AuthService.refreshToken(token);
      return Response.success(res, 'Token refreshed successfully', { token: accessToken, user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;