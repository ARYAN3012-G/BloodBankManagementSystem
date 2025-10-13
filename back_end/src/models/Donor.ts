import mongoose, { Schema, Document, Types } from 'mongoose';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface DonationRecord {
  date: Date;
  units: number; // units donated (typically 1)
}

export interface DonorDocument extends Document {
  userId: Types.ObjectId;
  bloodGroup: BloodGroup;
  dob?: Date;
  lastDonationDate?: Date;
  donationHistory: DonationRecord[];
  eligibilityNotes?: string;
  
  // Hybrid Availability System
  isAvailable: boolean;      // Donor self-control
  isActive: boolean;         // Admin control
  nextEligibleDate?: Date;   // Auto-calculated (90 days from last donation)
  
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
});

const DonorSchema = new Schema<DonorDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], required: true },
    dob: { type: Date },
    lastDonationDate: { type: Date },
    donationHistory: { type: [DonationRecordSchema], default: [] },
    eligibilityNotes: { type: String },
    
    // Hybrid Availability System
    isAvailable: { type: Boolean, default: true },      // Donors available by default
    isActive: { type: Boolean, default: true },         // Active by default
    nextEligibleDate: { type: Date },                   // Calculated automatically
  },
  { timestamps: true }
);

// Constants
const DONATION_WAITING_PERIOD_DAYS = 90; // 90 days for whole blood

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
  return this.isActive && this.isAvailable && this.isDonorEligible();
};

// Auto-update nextEligibleDate before saving
DonorSchema.pre('save', function(next) {
  if (this.isModified('lastDonationDate') && this.lastDonationDate) {
    this.nextEligibleDate = this.calculateNextEligibleDate();
  }
  next();
});

export const DonorModel = mongoose.model<DonorDocument>('Donor', DonorSchema);


