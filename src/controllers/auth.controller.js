import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { registerSchema, loginSchema } from '../utils/validators.js';

const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
  return { accessToken, refreshToken };
};

export const register = async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) return errorResponse(res, 400, error.details[0].message);

    const { name, email, password, city, examPreparingFor, monthlyBudget, wakeTime, sleepTime } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return errorResponse(res, 400, 'User already exists');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name, email, passwordHash, city, examPreparingFor, monthlyBudget, wakeTime, sleepTime
    });

    if (user) {
      const tokens = generateTokens(user._id);
      return successResponse(res, 201, 'User registered successfully', {
        user: { _id: user._id, name: user.name, email: user.email },
        ...tokens
      });
    } else {
      return errorResponse(res, 400, 'Invalid user data');
    }
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return errorResponse(res, 400, error.details[0].message);

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, 401, 'Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return errorResponse(res, 401, 'Invalid email or password');

    const tokens = generateTokens(user._id);
    return successResponse(res, 200, 'Login successful', {
      user: { _id: user._id, name: user.name, email: user.email },
      ...tokens
    });
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return errorResponse(res, 401, 'Refresh token required');

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return errorResponse(res, 401, 'Invalid token');

    const tokens = generateTokens(user._id);
    return successResponse(res, 200, 'Token refreshed successfully', tokens);
  } catch (err) {
    return errorResponse(res, 401, 'Invalid refresh token', err.message);
  }
};

export const logout = (req, res) => {
  // Client-side should discard the token. We can optionally blacklist tokens in DB.
  return successResponse(res, 200, 'Logged out successfully');
};

export const forgotPassword = async (req, res) => {
  // Implementation for forgot password (email send)
  return successResponse(res, 200, 'Password reset email sent (mock)');
};

export const resetPassword = async (req, res) => {
  // Implementation for reset password
  return successResponse(res, 200, 'Password reset successfully (mock)');
};
