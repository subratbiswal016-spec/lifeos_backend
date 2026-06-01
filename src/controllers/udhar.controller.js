import Udhar from '../models/Udhar.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getUdhars = async (req, res) => {
  try {
    const udhars = await Udhar.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, 200, 'Udhars fetched successfully', udhars);
  } catch (err) {
    return errorResponse(res, 500, 'Error fetching udhars', err.message);
  }
};

export const addUdhar = async (req, res) => {
  try {
    const { personName, amount, type, description, date } = req.body;
    
    if (!personName || !amount || !type) {
      return errorResponse(res, 400, 'Please provide all required fields');
    }

    const udhar = new Udhar({
      userId: req.user._id,
      personName,
      amount,
      type,
      description,
      date: date || new Date()
    });

    await udhar.save();
    return successResponse(res, 201, 'Udhar added successfully', udhar);
  } catch (err) {
    return errorResponse(res, 500, 'Error adding udhar', err.message);
  }
};

export const updateUdhar = async (req, res) => {
  try {
    const { id } = req.params;
    const { personName, amount, type, description, date, isSettled } = req.body;

    const udhar = await Udhar.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { personName, amount, type, description, date, isSettled },
      { new: true }
    );

    if (!udhar) {
      return errorResponse(res, 404, 'Udhar not found');
    }

    return successResponse(res, 200, 'Udhar updated successfully', udhar);
  } catch (err) {
    return errorResponse(res, 500, 'Error updating udhar', err.message);
  }
};

export const deleteUdhar = async (req, res) => {
  try {
    const { id } = req.params;
    const udhar = await Udhar.findOneAndDelete({ _id: id, userId: req.user._id });
    
    if (!udhar) {
      return errorResponse(res, 404, 'Udhar not found');
    }

    return successResponse(res, 200, 'Udhar deleted successfully');
  } catch (err) {
    return errorResponse(res, 500, 'Error deleting udhar', err.message);
  }
};
