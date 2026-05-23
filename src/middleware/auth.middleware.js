import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select('-passwordHash');
      
      if (!req.user) {
        return errorResponse(res, 401, 'Not authorized, user not found');
      }
      
      // Update last active
      req.user.lastActiveAt = new Date();
      await req.user.save();
      
      next();
    } catch (error) {
      console.error(error);
      return errorResponse(res, 401, 'Not authorized, token failed', error.message);
    }
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized, no token');
  }
};
