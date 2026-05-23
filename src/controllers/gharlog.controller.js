import FamilyMember from '../models/FamilyMember.js';
import DoctorVisit from '../models/DoctorVisit.js';
import SymptomLog from '../models/SymptomLog.js';
import { successResponse, errorResponse } from '../utils/response.js';

// --- FAMILY MEMBERS ---
export const getMembers = async (req, res) => {
  try {
    const members = await FamilyMember.find({ userId: req.user._id });
    return successResponse(res, 200, 'Family members fetched', members);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const addMember = async (req, res) => {
  try {
    const member = await FamilyMember.create({ userId: req.user._id, ...req.body });
    return successResponse(res, 201, 'Member added', member);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const updateMember = async (req, res) => {
  try {
    const member = await FamilyMember.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body },
      { new: true }
    );
    if (!member) return errorResponse(res, 404, 'Member not found');
    return successResponse(res, 200, 'Member updated', member);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const deleteMember = async (req, res) => {
  try {
    const member = await FamilyMember.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!member) return errorResponse(res, 404, 'Member not found');
    return successResponse(res, 200, 'Member deleted');
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

// --- DOCTOR VISITS ---
export const getVisits = async (req, res) => {
  try {
    const visits = await DoctorVisit.find({ memberId: req.params.memberId, userId: req.user._id });
    return successResponse(res, 200, 'Visits fetched', visits);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const logVisit = async (req, res) => {
  try {
    const visit = await DoctorVisit.create({ userId: req.user._id, ...req.body });
    return successResponse(res, 201, 'Visit logged', visit);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const updateVisit = async (req, res) => {
  try {
    const visit = await DoctorVisit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body },
      { new: true }
    );
    if (!visit) return errorResponse(res, 404, 'Visit not found');
    return successResponse(res, 200, 'Visit updated', visit);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const deleteVisit = async (req, res) => {
  try {
    const visit = await DoctorVisit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!visit) return errorResponse(res, 404, 'Visit not found');
    return successResponse(res, 200, 'Visit deleted');
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const uploadPrescription = async (req, res) => {
  try {
    // Requires multer + cloudinary integration for real use
    const imageUrl = req.file ? req.file.path : 'mock_url'; 
    const visit = await DoctorVisit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { prescriptionImageUrl: imageUrl },
      { new: true }
    );
    return successResponse(res, 200, 'Prescription uploaded', visit);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

// --- SYMPTOMS ---
export const getSymptoms = async (req, res) => {
  try {
    const symptoms = await SymptomLog.find({ memberId: req.params.memberId, userId: req.user._id })
      .sort({ date: -1 });
    return successResponse(res, 200, 'Symptoms fetched', symptoms);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const logSymptom = async (req, res) => {
  try {
    const symptom = await SymptomLog.create({ userId: req.user._id, ...req.body });
    return successResponse(res, 201, 'Symptom logged', symptom);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const getLatestSymptom = async (req, res) => {
  try {
    const symptom = await SymptomLog.findOne({ memberId: req.params.memberId, userId: req.user._id })
      .sort({ date: -1 });
    return successResponse(res, 200, 'Latest symptom fetched', symptom || {});
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};
