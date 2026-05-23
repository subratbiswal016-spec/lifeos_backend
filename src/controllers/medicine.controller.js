import Medicine from '../models/Medicine.js';
import MedicineLog from '../models/MedicineLog.js';
import { successResponse, errorResponse } from '../utils/response.js';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ memberId: req.params.memberId, userId: req.user._id, isActive: true });
    return successResponse(res, 200, 'Medicines fetched', medicines);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const addMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.create({ userId: req.user._id, ...req.body });
    return successResponse(res, 201, 'Medicine added', medicine);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body },
      { new: true }
    );
    if (!medicine) return errorResponse(res, 404, 'Medicine not found');
    return successResponse(res, 200, 'Medicine updated', medicine);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!medicine) return errorResponse(res, 404, 'Medicine not found');
    return successResponse(res, 200, 'Medicine deleted (deactivated)');
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const logMedicine = async (req, res) => {
  try {
    const { date, scheduledTime, status } = req.body;
    let log = await MedicineLog.findOne({ 
      userId: req.user._id, 
      medicineId: req.params.id,
      date,
      scheduledTime
    });

    if (log) {
      log.status = status;
      log.takenAt = status === 'taken' ? new Date() : null;
      await log.save();
    } else {
      const medicine = await Medicine.findById(req.params.id);
      log = await MedicineLog.create({
        userId: req.user._id,
        memberId: medicine.memberId,
        medicineId: req.params.id,
        date,
        scheduledTime,
        status,
        takenAt: status === 'taken' ? new Date() : null
      });
    }
    
    // Update remaining quantity
    if (status === 'taken') {
      await Medicine.findByIdAndUpdate(req.params.id, { $inc: { remainingQuantity: -1 } });
    }

    return successResponse(res, 200, 'Medicine logged', log);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const getDueToday = async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.user._id, isActive: true });
    // In a real scenario, we'd filter based on startDate/endDate and today's date
    // Then find which reminderTimes are pending based on MedicineLogs
    return successResponse(res, 200, 'Medicines due today (mock)', medicines);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const getLowStock = async (req, res) => {
  try {
    const medicines = await Medicine.find({ 
      userId: req.user._id, 
      isActive: true,
      remainingQuantity: { $lt: 10 } // Or based on daily dose needed for next 3 days
    });
    return successResponse(res, 200, 'Low stock medicines fetched', medicines);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};
