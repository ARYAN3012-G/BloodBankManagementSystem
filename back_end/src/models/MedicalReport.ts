/**
 * Medical Report Model
 * 
 * This model represents medical reports uploaded by donors for admin review.
 * Reports are stored in Cloudinary cloud storage for persistent access across
 * all instances (local and deployed).
 * 
 * Workflow:
 * 1. Donor uploads medical report (PDF, JPG, PNG)
 * 2. File is uploaded to Cloudinary, URL is saved
 * 3. Status is set to 'pending'
 * 4. Admin reviews and approves/rejects the report
 * 5. Donor eligibility is updated based on approval status
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * Medical Report Document Interface
 * Defines the structure of a medical report in the database
 */
export interface MedicalReportDocument extends Document {
  donorId: mongoose.Types.ObjectId;              // Reference to the donor who uploaded
  reportType: 'health_checkup' | 'blood_test' | 'medical_clearance' | 'other';
  reportUrl: string;                              // Full Cloudinary URL to the file
  cloudinaryPublicId?: string;                    // Cloudinary ID for file deletion
  fileName: string;                               // Original filename
  fileSize: number;                               // File size in bytes
  uploadedAt: Date;                               // Upload timestamp
  status: 'pending' | 'approved' | 'rejected';    // Review status
  reviewedBy?: mongoose.Types.ObjectId;           // Admin who reviewed (optional)
  reviewedAt?: Date;                              // Review timestamp (optional)
  reviewNotes?: string;                           // Admin's review notes (optional)
  validUntil?: Date;                              // Expiration date (optional)
  isActive: boolean;                              // Soft delete flag
}

/**
 * MongoDB Schema Definition for Medical Reports
 */
const MedicalReportSchema = new Schema<MedicalReportDocument>({
  donorId: {
    type: Schema.Types.ObjectId,
    ref: 'Donor',
    required: true
  },
  reportType: {
    type: String,
    enum: ['health_checkup', 'blood_test', 'medical_clearance', 'other'],
    required: true
  },
  reportUrl: {
    type: String,
    required: true  // Cloudinary HTTPS URL
  },
  cloudinaryPublicId: {
    type: String,
    required: false  // Used for deleting files from Cloudinary
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'  // All new reports start as pending
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'  // References the admin who reviewed
  },
  reviewedAt: Date,
  reviewNotes: String,
  validUntil: Date,
  isActive: {
    type: Boolean,
    default: true  // For soft delete functionality
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt
});

// Database indexes for optimizing queries
// Index 1: Find reports by donor and status (e.g., donor's pending reports)
MedicalReportSchema.index({ donorId: 1, status: 1 });
// Index 2: Find reports by status sorted by upload date (e.g., all pending reports, newest first)
MedicalReportSchema.index({ status: 1, uploadedAt: -1 });

export const MedicalReportModel = mongoose.model<MedicalReportDocument>('MedicalReport', MedicalReportSchema);
