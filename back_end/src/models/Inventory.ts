import mongoose, { Schema, Document } from 'mongoose';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface InventoryDocument extends Document {
  bloodGroup: BloodGroup;
  units: number; // total available units
  expiryDate: Date; // earliest expiry for FIFO picking
  location?: string; // optional storage location/code
  donorId?: mongoose.Types.ObjectId; // who donated this blood
  collectionDate?: Date; // when blood was collected
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<InventoryDocument>(
  {
    bloodGroup: { type: String, enum: ['A+','A-','B+','B-','AB+','AB-','O+','O-'], required: true, index: true },
    units: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date, required: true, index: true },
    location: { type: String },
    donorId: { type: Schema.Types.ObjectId, ref: 'Donor' },
    collectionDate: { type: Date },
  },
  { timestamps: true }
);

InventorySchema.index({ bloodGroup: 1, expiryDate: 1 });

export const InventoryModel = mongoose.model<InventoryDocument>('Inventory', InventorySchema);


