import { Request, Response } from 'express';
import { MedicalReportModel } from '../models/MedicalReport';
import { DonorModel } from '../models/Donor';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/medical-reports';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `medical-report-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Accept only PDF, JPG, PNG files
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload medical report (donor)
export async function uploadMedicalReport(req: Request, res: Response) {
  try {
    const userId = req.user?.sub;
    const { reportType, validUntil } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Find donor profile
    const donor = await DonorModel.findOne({ userId });
    if (!donor) {
      return res.status(404).json({ error: 'Donor profile not found' });
    }

    // Create medical report record
    const medicalReport = await MedicalReportModel.create({
      donorId: donor._id,
      reportType: reportType || 'health_checkup',
      reportUrl: `/uploads/medical-reports/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      validUntil: validUntil ? new Date(validUntil) : undefined
    });

    return res.status(201).json({
      message: 'Medical report uploaded successfully',
      report: {
        id: medicalReport._id,
        fileName: medicalReport.fileName,
        reportType: medicalReport.reportType,
        status: medicalReport.status,
        uploadedAt: medicalReport.uploadedAt
      }
    });

  } catch (error) {
    console.error('Upload medical report error:', error);
    return res.status(500).json({ error: 'Failed to upload medical report' });
  }
}

// Get donor's medical reports
export async function getDonorMedicalReports(req: Request, res: Response) {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const donor = await DonorModel.findOne({ userId });
    if (!donor) {
      return res.status(404).json({ error: 'Donor profile not found' });
    }

    const reports = await MedicalReportModel.find({ donorId: donor._id })
      .populate('reviewedBy', 'name email')
      .sort({ uploadedAt: -1 });

    return res.json(reports);

  } catch (error) {
    console.error('Get donor medical reports error:', error);
    return res.status(500).json({ error: 'Failed to fetch medical reports' });
  }
}

// Get all pending medical reports (admin)
export async function getPendingMedicalReports(req: Request, res: Response) {
  try {
    const reports = await MedicalReportModel.find({ status: 'pending' })
      .populate({
        path: 'donorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .sort({ uploadedAt: -1 });

    return res.json(reports);

  } catch (error) {
    console.error('Get pending medical reports error:', error);
    return res.status(500).json({ error: 'Failed to fetch pending reports' });
  }
}

// Review medical report (admin)
export async function reviewMedicalReport(req: Request, res: Response) {
  try {
    const { reportId } = req.params;
    const { status, reviewNotes } = req.body;
    const adminId = req.user?.sub;

    if (!adminId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be approved or rejected' });
    }

    const report = await MedicalReportModel.findById(reportId)
      .populate({
        path: 'donorId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    if (!report) {
      return res.status(404).json({ error: 'Medical report not found' });
    }

    // Update report status
    report.status = status as 'approved' | 'rejected';
    report.reviewedBy = new mongoose.Types.ObjectId(adminId);
    report.reviewedAt = new Date();
    report.reviewNotes = reviewNotes;

    await report.save();

    // Update donor eligibility based on report status
    const donor = await DonorModel.findById(report.donorId);
    if (donor) {
      if (status === 'approved') {
        donor.verificationStatus = 'verified';
        donor.eligibilityStatus = 'eligible'; // Fix: Set eligibility status
        donor.eligibilityNotes = 'Medical report approved - donor eligible for donation';
      } else {
        donor.verificationStatus = 'rejected';
        donor.eligibilityStatus = 'not_eligible'; // Fix: Set eligibility status
        donor.eligibilityNotes = reviewNotes || 'Medical report rejected - donor not eligible';
      }
      await donor.save();
    }

    return res.json({
      message: `Medical report ${status} successfully`,
      report: {
        id: report._id,
        status: report.status,
        reviewNotes: report.reviewNotes,
        reviewedAt: report.reviewedAt,
        donorName: (report.donorId as any).userId.name
      }
    });

  } catch (error) {
    console.error('Review medical report error:', error);
    return res.status(500).json({ error: 'Failed to review medical report' });
  }
}

// Get medical reports for a specific donor (admin only)
export async function getDonorMedicalReportsById(req: Request, res: Response) {
  try {
    const { donorId } = req.params;
    
    if (!donorId) {
      return res.status(400).json({ error: 'Donor ID is required' });
    }

    const reports = await MedicalReportModel.find({ 
      donorId: donorId,
      isActive: true 
    })
    .populate('reviewedBy', 'name email')
    .sort({ uploadedAt: -1 });

    return res.json(reports);

  } catch (error) {
    console.error('Get donor medical reports error:', error);
    return res.status(500).json({ error: 'Failed to fetch donor medical reports' });
  }
}

// Delete medical report
export async function deleteMedicalReport(req: Request, res: Response) {
  try {
    const { reportId } = req.params;
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const report = await MedicalReportModel.findById(reportId)
      .populate('donorId');

    if (!report) {
      return res.status(404).json({ error: 'Medical report not found' });
    }

    // Check if user owns this report or is admin
    const donor = await DonorModel.findOne({ userId });
    const isOwner = donor && donor._id.equals(report.donorId);
    const isAdmin = req.user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this report' });
    }

    // Delete file from filesystem
    const filePath = path.join(process.cwd(), report.reportUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await MedicalReportModel.findByIdAndDelete(reportId);

    return res.json({ message: 'Medical report deleted successfully' });

  } catch (error) {
    console.error('Delete medical report error:', error);
    return res.status(500).json({ error: 'Failed to delete medical report' });
  }
}
