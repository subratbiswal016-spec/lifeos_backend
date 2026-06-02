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

    const { name, password, city, examPreparingFor, monthlyBudget, wakeTime, sleepTime } = req.body;
    const email = req.body.email.toLowerCase();

    const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const userExists = await User.findOne({ email: new RegExp('^' + escapeRegex(email) + '$', 'i') });
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

    const email = req.body.email;
    const { password } = req.body;

    const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const user = await User.findOne({ email: new RegExp('^' + escapeRegex(email) + '$', 'i') });
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

import fs from 'fs/promises';

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, 400, 'Email is required');
    
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return errorResponse(res, 404, 'User with this email does not exist');

    // Generate 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetPasswordOtp = otpCode;
    user.resetPasswordOtpExpires = expiresAt;
    await user.save();

    // Log to console for dev visibility
    console.log(`\n==================================================`);
    console.log(`PASSWORD RESET REQUEST FOR: ${normalizedEmail}`);
    console.log(`OTP CODE: ${otpCode}`);
    console.log(`EXPIRES AT: ${expiresAt.toISOString()}`);
    console.log(`==================================================\n`);

    // Write to a local file for developer testing convenience
    try {
      const codePath = 'c:/project/LifeOS/server/reset_codes.json';
      let codes = {};
      try {
        const fileContent = await fs.readFile(codePath, 'utf8');
        codes = JSON.parse(fileContent);
      } catch (err) {
        // File doesn't exist or is empty
      }
      codes[normalizedEmail] = {
        otp: otpCode,
        expiresAt: expiresAt.toISOString(),
      };
      await fs.writeFile(codePath, JSON.stringify(codes, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save OTP to reset_codes.json:', err);
    }

    const responseData = {};
    if (process.env.NODE_ENV === 'development' || true) { // Always return in dev/offline mode for absolute convenience
      responseData.otp = otpCode;
    }

    return successResponse(res, 200, 'Password reset OTP sent. Check terminal logs or reset_codes.json', responseData);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return errorResponse(res, 400, 'Email, OTP, and new password are required');
    }

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return errorResponse(res, 404, 'User not found');

    // Verify OTP
    if (!user.resetPasswordOtp || user.resetPasswordOtp !== otp) {
      return errorResponse(res, 400, 'Invalid OTP code');
    }

    if (!user.resetPasswordOtpExpires || user.resetPasswordOtpExpires < new Date()) {
      return errorResponse(res, 400, 'OTP code has expired');
    }

    // Hash and update password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    user.passwordHash = passwordHash;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    return successResponse(res, 200, 'Password reset successfully');
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};
