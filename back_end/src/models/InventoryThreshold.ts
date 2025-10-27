import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryThreshold extends Document {
  bloodGroup: string;
  minimumUnits: number;
  targetUnits: number;
  alertEnabled: boolean;
  lastAlertDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryThresholdSchema = new Schema<IInventoryThreshold>({
  bloodGroup: {
    type: String,
    required: true,
    unique: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  minimumUnits: {
    type: Number,
    required: true,
    default: 5,
    min: 0
  },
  targetUnits: {
    type: Number,
    required: true,
    default: 20,
    min: 0
  },
  alertEnabled: {
    type: Boolean,
    default: true
  },
  lastAlertDate: {
    type: Date
  }
}, {
  timestamps: true
});

export const InventoryThresholdModel = mongoose.model<IInventoryThreshold>('InventoryThreshold', InventoryThresholdSchema);
