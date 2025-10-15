import mongoose, { Schema, Document, Types } from 'mongoose';

export type RequestStatus = 'pending' | 'approved' | 'collected' | 'verified' | 'no-show' | 'rejected' | 'cancelled' | 'reschedule-requested';
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
  
  // Enhanced fields for donation flow
  requiredBy?: Date; // When blood is needed
  patientInfo?: {
    age?: number;
    condition?: string;
    isEmergency?: boolean;
  };
  hospitalName?: string;
  contactPerson?: string;
  contactPhone?: string;
  
  // Donation tracking
  donorsNotified?: number; // How many donors were notified
  donorsResponded?: number; // How many responded
  appointmentsScheduled?: number; // How many appointments scheduled
  unitsCollected?: number; // Actual units collected through donations
  
  // Approval/Rejection
  approvedOn?: Date;
  rejectedOn?: Date;
  rejectionReason?: string;
  
  // Collection tracking
  collectionDate?: Date;
  collectionLocation?: string;
  collectionInstructions?: string;
  collectedAt?: Date;
  collectedByUserConfirmation?: boolean;
  verifiedByAdmin?: boolean;
  verifiedAt?: Date;
  verifiedByUserId?: Types.ObjectId;
  
  // Reschedule
  rescheduleRequested?: boolean;
  rescheduleReason?: string;
  originalCollectionDate?: Date;
  newRequestedDate?: Date;
  rescheduleApproved?: boolean;
  
  // No-show
  noShowDetectedAt?: Date;
  noShowReason?: string;
  
  // Cancellation
  cancelledAt?: Date;
  cancellationReason?: string;
  
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
    bloodGroup: { 
      type: String, 
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 
      required: true 
    },
    unitsRequested: { type: Number, required: true, min: 1 },
    urgency: { 
      type: String, 
      enum: ['Low', 'Medium', 'High', 'Critical'], 
      default: 'Medium' 
    },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'collected', 'verified', 'no-show', 'rejected', 'cancelled', 'reschedule-requested'], 
      default: 'pending' 
    },
    medicalReportUrl: { type: String },
    notes: { type: String },
    assignedUnits: { type: Number, default: 0 },
    
    // Enhanced fields for donation flow
    requiredBy: { type: Date },
    patientInfo: {
      age: Number,
      condition: String,
      isEmergency: { type: Boolean, default: false }
    },
    hospitalName: String,
    contactPerson: String,
    contactPhone: String,
    
    // Donation tracking
    donorsNotified: { type: Number, default: 0 },
    donorsResponded: { type: Number, default: 0 },
    appointmentsScheduled: { type: Number, default: 0 },
    unitsCollected: { type: Number, default: 0 },
    
    // Approval/Rejection
    approvedOn: { type: Date },
    rejectedOn: { type: Date },
    rejectionReason: { type: String },
    
    // Collection tracking
    collectionDate: { type: Date },
    collectionLocation: { type: String },
    collectionInstructions: { type: String },
    collectedAt: { type: Date },
    collectedByUserConfirmation: { type: Boolean, default: false },
    verifiedByAdmin: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    verifiedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    
    // Reschedule
    rescheduleRequested: { type: Boolean, default: false },
    rescheduleReason: { type: String },
    originalCollectionDate: { type: Date },
    newRequestedDate: { type: Date },
    rescheduleApproved: { type: Boolean, default: false },
    
    // No-show
    noShowDetectedAt: { type: Date },
    noShowReason: { type: String },
    
    // Cancellation
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    
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


