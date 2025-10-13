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
  createdAt: Date;
  updatedAt: Date;
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
  },
  { timestamps: true }
);

export const DonorModel = mongoose.model<DonorDocument>('Donor', DonorSchema);


