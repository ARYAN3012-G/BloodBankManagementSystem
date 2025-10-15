import mongoose, { Schema, Document, Types } from 'mongoose';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type DonorType = 'regular' | 'emergency' | 'flexible';
export type DonorStatus = 'active' | 'inactive' | 'suspended';

export interface DonationRecord {
  date: Date;
  units: number; // units donated (typically 1)
  bloodBankLocation?: string;
  notes?: string;
}

export interface DonorDocument extends Document {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  bloodGroup: BloodGroup;
  address?: string;
  emergencyContact?: string;

  // Donor Status & Type
  donorType: DonorType; // regular, emergency, flexible
  status: DonorStatus;

  // Donation History
  lastDonationDate?: Date;
  nextEligibleDate?: Date;
  totalDonations: number;
  donationHistory: DonationRecord[];

  // Availability & Preferences
  availability: {
    weekdays: boolean;
    weekends: boolean;
    evenings: boolean;
    mornings: boolean;
  };
  preferredLocations: string[];
  maxDistanceKm: number;

  // Notifications
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };

  // Medical Information
  weight?: number;
  height?: number;
  medicalConditions?: string[];
  medications?: string[];

  // Admin Fields
  registeredBy?: Types.ObjectId; // Admin who registered
  registrationDate: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  notes?: string;

  // Legacy fields for backward compatibility
  userId?: Types.ObjectId; // For linking to User model
  isAvailable?: boolean; // Donor availability toggle
  isActive?: boolean; // Admin control
  eligibilityStatus?: 'eligible' | 'not_eligible' | 'pending'; // Eligibility status
  eligibilityNotes?: string; // Admin notes

  createdAt: Date;
  updatedAt: Date;

  // Helper methods
  calculateNextEligibleDate(): Date | undefined;
  isDonorEligible(): boolean;
  getDaysUntilEligible(): number;
  canDonate(): boolean;
}

const DonationRecordSchema = new Schema<DonationRecord>({
  date: { type: Date, required: true },
  units: { type: Number, required: true, min: 1 },
  bloodBankLocation: { type: String },
  notes: { type: String }
});

const DonorSchema = new Schema<DonorDocument>(
  {
    // Personal Information
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], required: true },
    address: { type: String },
    emergencyContact: { type: String },

    // Donor Status & Type
    donorType: { type: String, enum: ['regular', 'emergency', 'flexible'], default: 'regular' },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },

    // Donation History
    lastDonationDate: { type: Date },
    nextEligibleDate: { type: Date },
    totalDonations: { type: Number, default: 0 },
    donationHistory: { type: [DonationRecordSchema], default: [] },

    // Availability & Preferences
    availability: {
      weekdays: { type: Boolean, default: true },
      weekends: { type: Boolean, default: false },
      evenings: { type: Boolean, default: true },
      mornings: { type: Boolean, default: false }
    },
    preferredLocations: [{ type: String }],
    maxDistanceKm: { type: Number, default: 10 },

    // Notifications
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      phone: { type: Boolean, default: false }
    },

    // Medical Information
    weight: { type: Number },
    height: { type: Number },
    medicalConditions: [{ type: String }],
    medications: [{ type: String }],

    // Admin Fields
    registeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    registrationDate: { type: Date, default: Date.now },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    notes: { type: String },

    // Legacy fields for backward compatibility
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    isAvailable: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    eligibilityStatus: { 
      type: String, 
      enum: ['eligible', 'not_eligible', 'pending'], 
      default: 'pending' 
    },
    eligibilityNotes: { type: String }
  },
  { timestamps: true }
);

// Constants
const DONATION_WAITING_PERIOD_DAYS = 90; // 90 days for whole blood

// Indexes for efficient queries
DonorSchema.index({ bloodGroup: 1, status: 1, nextEligibleDate: 1 });
DonorSchema.index({ email: 1 });
DonorSchema.index({ phone: 1 });
DonorSchema.index({ 'availability.weekdays': 1, 'availability.weekends': 1 });

// Helper method: Calculate next eligible date
DonorSchema.methods.calculateNextEligibleDate = function(): Date | undefined {
  if (!this.lastDonationDate) return undefined;

  const nextDate = new Date(this.lastDonationDate);
  nextDate.setDate(nextDate.getDate() + DONATION_WAITING_PERIOD_DAYS);
  return nextDate;
};

// Helper method: Check if donor is eligible based on time
DonorSchema.methods.isDonorEligible = function(): boolean {
  if (!this.lastDonationDate) return true; // Never donated = eligible

  const daysSinceLastDonation = Math.floor(
    (Date.now() - new Date(this.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceLastDonation >= DONATION_WAITING_PERIOD_DAYS;
};

// Helper method: Get days until eligible
DonorSchema.methods.getDaysUntilEligible = function(): number {
  if (!this.lastDonationDate) return 0;

  const daysSinceLastDonation = Math.floor(
    (Date.now() - new Date(this.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  const daysRemaining = DONATION_WAITING_PERIOD_DAYS - daysSinceLastDonation;
  return Math.max(0, daysRemaining);
};

// Helper method: Check if donor can donate (all conditions)
DonorSchema.methods.canDonate = function(): boolean {
  return this.status === 'active' && this.isDonorEligible();
};

// Auto-update nextEligibleDate before saving
DonorSchema.pre('save', function(next) {
  if (this.isModified('lastDonationDate') && this.lastDonationDate) {
    this.nextEligibleDate = this.calculateNextEligibleDate();
  }
  next();
});

export const DonorModel = mongoose.model<DonorDocument>('Donor', DonorSchema);


