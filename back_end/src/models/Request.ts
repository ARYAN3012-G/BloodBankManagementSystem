import mongoose, { Schema, Document, Types } from 'mongoose';

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type Urgency = 'Low' | 'Medium' | 'High' | 'Critical';

export interface RequestDocument extends Document {
  requesterUserId?: Types.ObjectId; // hospital/external user
  patientName?: string;
  bloodGroup: BloodGroup;
  unitsRequested: number;
  urgency?: Urgency; // Low, Medium, High, Critical
  status: RequestStatus;
  medicalReportUrl?: string; // for external uploads
  notes?: string;
  assignedUnits?: number; // units assigned automatically
  approvedOn?: Date; // when request was approved
  rejectedOn?: Date; // when request was rejected
  // External user fields
  contactNumber?: string;
  hospitalPreference?: string;
  // Hospital user fields
  department?: string;
  staffId?: string;
  doctorName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RequestSchema = new Schema<RequestDocument>(
  {
    requesterUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    patientName: { type: String },
    bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], required: true },
    unitsRequested: { type: Number, required: true, min: 1 },
    urgency: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    status: { type: String, enum: ['pending','approved','rejected','fulfilled'], default: 'pending', index: true },
    medicalReportUrl: { type: String },
    notes: { type: String },
    assignedUnits: { type: Number, default: 0 },
    approvedOn: { type: Date },
    rejectedOn: { type: Date },
    // External user fields
    contactNumber: { type: String },
    hospitalPreference: { type: String },
    // Hospital user fields
    department: { type: String },
    staffId: { type: String },
    doctorName: { type: String },
  },
  { timestamps: true }
);

RequestSchema.index({ status: 1, createdAt: -1 });

export const RequestModel = mongoose.model<RequestDocument>('Request', RequestSchema);


