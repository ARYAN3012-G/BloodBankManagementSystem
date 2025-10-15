import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'admin' | 'hospital' | 'donor' | 'external';

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  phone?: string;
  isMainAdmin?: boolean; // New: Mark the main admin
  adminStatus?: 'pending' | 'approved' | 'rejected'; // New: Admin approval status
  approvedBy?: mongoose.Types.ObjectId; // New: Who approved this admin
  approvedAt?: Date; // New: When approved
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'hospital', 'donor', 'external'], required: true },
    name: { type: String, required: true },
    phone: { type: String },
    isMainAdmin: { type: Boolean, default: false },
    adminStatus: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);


