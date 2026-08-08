const UserModel = require('../models/userModel');
const PasswordUtils = require('../utils/password');
const JWTUtils = require('../utils/jwt');

class AuthService {
  static async register({ name, email, phone, ward, password, role }) {
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      const error = new Error('Email is already registered');
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await PasswordUtils.hash(password);
    const user = await UserModel.create({
      name,
      email,
      phone,
      ward,
      hashedPassword,
      role: role || 'Citizen',
    });

    return user;
  }

  static async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await PasswordUtils.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      ward: user.ward,
    };

    const accessToken = JWTUtils.generateAccessToken(payload);
    const refreshToken = JWTUtils.generateRefreshToken(payload);

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
    };
  }

  static async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  static async refreshToken(token) {
    try {
      const decoded = JWTUtils.verifyRefreshToken(token);
      const user = await UserModel.findById(decoded.id);
      if (!user) {
        const error = new Error('User no longer exists');
        error.statusCode = 401;
        throw error;
      }

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        ward: user.ward,
      };

      const accessToken = JWTUtils.generateAccessToken(payload);
      return { accessToken, user };
    } catch (err) {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      throw error;
    }
  }
}

module.exports = AuthService;