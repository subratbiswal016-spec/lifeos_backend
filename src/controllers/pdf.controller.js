import FamilyMember from '../models/FamilyMember.js';
import DoctorVisit from '../models/DoctorVisit.js';
import SymptomLog from '../models/SymptomLog.js';
import StudySession from '../models/StudySession.js';
import MockTest from '../models/MockTest.js';
import { generateHealthReportPDF, generateStudyReportPDF } from '../services/pdf.service.js';
import { errorResponse } from '../utils/response.js';

export const getFamilyReport = async (req, res) => {
  try {
    const member = await FamilyMember.findOne({ _id: req.params.memberId, userId: req.user._id });
    if (!member) return errorResponse(res, 404, 'Member not found');

    const visits = await DoctorVisit.find({ memberId: member._id }).sort({ date: -1 }).limit(10);
    const symptoms = await SymptomLog.find({ memberId: member._id }).sort({ date: -1 }).limit(10);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=health_report_${member.name}.pdf`);

    await generateHealthReportPDF(member, visits, symptoms, res);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};

export const getStudyReport = async (req, res) => {
  try {
    const sessions = await StudySession.find({ userId: req.user._id })
      .populate('subjectId', 'name')
      .sort({ date: -1 })
      .limit(20);
    const tests = await MockTest.find({ userId: req.user._id })
      .populate('subjectId', 'name')
      .sort({ date: -1 })
      .limit(10);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=study_report_${req.user.name}.pdf`);

    await generateStudyReportPDF(req.user, sessions, tests, res);
  } catch (err) {
    return errorResponse(res, 500, 'Server error', err.message);
  }
};
