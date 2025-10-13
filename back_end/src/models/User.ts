import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'admin' | 'hospital' | 'donor' | 'external';

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  phone?: string;
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
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>('User', UserSchema);


