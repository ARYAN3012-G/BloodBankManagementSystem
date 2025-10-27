/**
 * Medical Report Controller
 * 
 * Handles all medical report operations including:
 * - File uploads to Cloudinary cloud storage
 * - Donor report viewing
 * - Admin review and approval/rejection
 * - File deletion from cloud storage
 * 
 * All uploaded files are stored in Cloudinary to ensure:
 * - Persistent storage across server restarts
 * - Accessibility from all instances (local and deployed)
 * - No file loss on ephemeral filesystems (like Render)
 */

import { Request, Response } from 'express';
import { MedicalReportModel } from '../models/MedicalReport';
import { DonorModel } from '../models/Donor';
import mongoose from 'mongoose';
import multer from 'multer';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload';

/**
 * File Filter for Multer
 * Validates file types before upload to prevent unsupported formats
 * Only allows medical report formats: PDF, JPG, PNG
 */
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);  // Accept the file
  } else {
    cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);  // Reject the file
  }
};

/**
 * Multer Configuration for Medical Reports
 * Uses memory storage (not disk) to temporarily hold files before uploading to Cloudinary
 * This prevents files from being saved to local disk on ephemeral filesystems
 */
const medicalReportMulter = multer({
  // @ts-ignore - multer v2 typing issue, memoryStorage exists at runtime
  storage: multer.memoryStorage(),  // Store in memory, not disk
  fileFilter,                        // Apply file type validation
  limits: {
    fileSize: 10 * 1024 * 1024      // 10MB maximum file size
  }
});

// Export multer middleware for use in routes
export const medicalReportUpload: any = medicalReportMulter;

/**
 * Upload Medical Report
 * 
 * Allows donors to upload medical reports for admin review.
 * Files are uploaded to Cloudinary cloud storage for persistence.
 * 
 * @route POST /api/medical-reports/upload
 * @access Donor only
 * @param req.file - The uploaded file (PDF/JPG/PNG, max 10MB)
 * @param req.body.reportType - Type of report (health_checkup, blood_test, etc.)
 * @param req.body.validUntil - Optional expiration date
 * @returns 201 with report details on success
 */
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

    // Find donor profile associated with this user
    const donor = await DonorModel.findOne({ userId });
    if (!donor) {
      return res.status(404).json({ error: 'Donor profile not found' });
    }

    // Determine Cloudinary resource type (image for JPG/PNG, raw for PDF)
    const resourceType = req.file.mimetype.startsWith('image/') ? 'image' : 'raw';

    // Upload file buffer to Cloudinary cloud storage
    // Files are stored in: blood-bank/medical-reports/ folder
    const cloudinaryResult = await uploadToCloudinary(
      req.file.buffer,                      // File data from memory
      'blood-bank/medical-reports',         // Cloudinary folder
      resourceType                           // image or raw (PDF)
    );

    // Create medical report record in database
    const medicalReport = await MedicalReportModel.create({
      donorId: donor._id,
      reportType: reportType || 'health_checkup',  // Default to health checkup
      reportUrl: cloudinaryResult.url,              // Full Cloudinary HTTPS URL
      cloudinaryPublicId: cloudinaryResult.publicId, // For deletion
      fileName: req.file.originalname,              // Original file name
      fileSize: cloudinaryResult.bytes,             // File size from Cloudinary
      validUntil: validUntil ? new Date(validUntil) : undefined  // Optional expiry
    });

    return res.status(201).json({
      message: 'Medical report uploaded successfully',
      report: {
        id: medicalReport._id,
        fileName: medicalReport.fileName,
        reportType: medicalReport.reportType,
        reportUrl: medicalReport.reportUrl,
        status: medicalReport.status,
        uploadedAt: medicalReport.uploadedAt
      }
    });

  } catch (error) {
    console.error('Upload medical report error:', error);
    return res.status(500).json({ error: 'Failed to upload medical report' });
  }
}

/**
 * Get Donor's Medical Reports
 * 
 * Retrieves all medical reports for the authenticated donor.
 * Reports are sorted by upload date (newest first).
 * 
 * @route GET /api/medical-reports/my-reports
 * @access Donor only
 * @returns Array of medical reports with review details
 */
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

/**
 * Get All Pending Medical Reports
 * 
 * Retrieves all medical reports that are awaiting admin review.
 * Used by admins to see which reports need to be reviewed.
 * 
 * @route GET /api/medical-reports/pending
 * @access Admin only
 * @returns Array of pending reports with donor information
 */
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

/**
 * Review Medical Report
 * 
 * Allows admins to approve or reject a medical report.
 * Updates donor's verification status and eligibility based on the decision.
 * 
 * @route PATCH /api/medical-reports/:reportId/review
 * @access Admin only
 * @param req.params.reportId - ID of the report to review
 * @param req.body.status - 'approved' or 'rejected'
 * @param req.body.reviewNotes - Optional notes from the admin
 * @returns Updated report details
 */
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

    // Update report with review decision
    report.status = status as 'approved' | 'rejected';
    report.reviewedBy = new mongoose.Types.ObjectId(adminId);
    report.reviewedAt = new Date();
    report.reviewNotes = reviewNotes;

    await report.save();

    // Update donor's verification and eligibility status based on review decision
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

/**
 * Get Medical Reports for Specific Donor
 * 
 * Retrieves all medical reports for a specific donor by donor ID.
 * Used by admins to view a donor's medical history.
 * 
 * @route GET /api/medical-reports/donor/:donorId
 * @access Admin only
 * @param req.params.donorId - MongoDB ID of the donor
 * @returns Array of medical reports for the specified donor
 */
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

/**
 * Delete Medical Report
 * 
 * Allows donors to delete their own pending reports or admins to delete any report.
 * Files are deleted from both Cloudinary and the database.
 * 
 * @route DELETE /api/medical-reports/:reportId
 * @access Donor (own reports) or Admin (any report)
 * @param req.params.reportId - ID of the report to delete
 * @returns Success message
 */
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

    // Delete file from Cloudinary cloud storage
    if (report.cloudinaryPublicId) {
      try {
        // Determine resource type based on URL (PDF = raw, images = image)
        const resourceType = report.reportUrl.includes('.pdf') ? 'raw' : 'image';
        await deleteFromCloudinary(report.cloudinaryPublicId, resourceType);
      } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        // Continue with database deletion even if cloud deletion fails
        // This prevents orphaned database records
      }
    }

    // Delete from database
    await MedicalReportModel.findByIdAndDelete(reportId);

    return res.json({ message: 'Medical report deleted successfully' });

  } catch (error) {
    console.error('Delete medical report error:', error);
    return res.status(500).json({ error: 'Failed to delete medical report' });
  }
}
