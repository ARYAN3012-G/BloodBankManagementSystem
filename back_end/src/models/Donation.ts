import mongoose, { Schema, Document, Types } from 'mongoose';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type DonationStatus = 'scheduled' | 'collected' | 'cancelled';

export interface DonationDocument extends Document {
  donorId: Types.ObjectId;           // Reference to donor
  requestId?: Types.ObjectId;        // Optional: linked to a request
  collectionDate: Date;              // When blood was collected
  units: number;                     // Units collected (typically 1)
  bloodGroup: BloodGroup;            // Blood group donated
  recordedBy: Types.ObjectId;        // Admin who recorded this
  verifiedBy?: string;               // Staff name/signature
  notes?: string;                    // Additional notes
  status: DonationStatus;            // Status of donation
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<DonationDocument>(
  {
    donorId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Donor', 
      required: true, 
      index: true 
    },
    requestId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Request' 
    },
    collectionDate: { 
      type: Date, 
      required: true,
      default: Date.now 
    },
    units: { 
      type: Number, 
      required: true, 
      min: 1,
      default: 1 
    },
    bloodGroup: { 
      type: String, 
      enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], 
      required: true 
    },
    recordedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    verifiedBy: { 
      type: String 
    },
    notes: { 
      type: String 
    },
    status: { 
      type: String, 
      enum: ['scheduled', 'collected', 'cancelled'],
      default: 'collected',
      index: true
    }
  },
  { timestamps: true }
);

// Indexes for efficient queries
DonationSchema.index({ donorId: 1, collectionDate: -1 });
DonationSchema.index({ status: 1, collectionDate: -1 });
DonationSchema.index({ bloodGroup: 1, collectionDate: -1 });

export const DonationModel = mongoose.model<DonationDocument>('Donation', DonationSchema);
