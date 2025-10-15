import mongoose, { Schema, Document } from 'mongoose';

export interface MedicalReportDocument extends Document {
  donorId: mongoose.Types.ObjectId;
  reportType: 'health_checkup' | 'blood_test' | 'medical_clearance' | 'other';
  reportUrl: string; // File URL
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId; // Admin who reviewed
  reviewedAt?: Date;
  reviewNotes?: string;
  validUntil?: Date; // When this report expires
  isActive: boolean;
}

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
    required: true
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
    default: 'pending'
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String,
  validUntil: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
MedicalReportSchema.index({ donorId: 1, status: 1 });
MedicalReportSchema.index({ status: 1, uploadedAt: -1 });

export const MedicalReportModel = mongoose.model<MedicalReportDocument>('MedicalReport', MedicalReportSchema);
