import { Schema, model, Document, Types } from 'mongoose';

export interface NotificationDocument extends Document {
  // Core fields
  type: 'donation_request' | 'appointment_reminder' | 'donation_thanks' | 'campaign_invite' | 'appointment_confirmation';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'pending' | 'sent' | 'read' | 'responded' | 'expired';
  
  // Content
  title: string;
  message: string;
  
  // Recipients
  recipientId: Types.ObjectId; // Donor ID
  recipientType: 'donor' | 'admin' | 'hospital';
  
  // Related entities
  requestId?: Types.ObjectId; // Blood request ID
  campaignId?: Types.ObjectId; // Campaign ID
  appointmentId?: Types.ObjectId; // Appointment ID
  
  // Scheduling
  scheduledFor?: Date; // When to send
  sentAt?: Date; // When actually sent
  readAt?: Date; // When recipient read it
  respondedAt?: Date; // When recipient responded
  expiresAt?: Date; // When notification expires
  
  // Response data
  response?: {
    action: 'accept' | 'decline' | 'maybe';
    message?: string;
    preferredSlots?: Date[];
    respondedAt: Date;
  };
  
  // Metadata
  createdBy: Types.ObjectId; // Admin who created
  metadata?: {
    bloodGroup?: string;
    unitsNeeded?: number;
    hospitalName?: string;
    urgencyLevel?: string;
  };
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    type: {
      type: String,
      enum: ['donation_request', 'appointment_reminder', 'donation_thanks', 'campaign_invite', 'appointment_confirmation'],
      required: true
    },
    priority: {
      type: String,
      enum: ['urgent', 'high', 'normal', 'low'],
      default: 'normal'
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'read', 'responded', 'expired'],
      default: 'pending'
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'Donor', required: true },
    recipientType: {
      type: String,
      enum: ['donor', 'admin', 'hospital'],
      default: 'donor'
    },
    requestId: { type: Schema.Types.ObjectId, ref: 'Request' },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
    scheduledFor: { type: Date },
    sentAt: { type: Date },
    readAt: { type: Date },
    respondedAt: { type: Date },
    expiresAt: { type: Date },
    response: {
      type: {
        action: {
          type: String,
          enum: ['accept', 'decline', 'maybe']
        },
        message: String,
        preferredSlots: [Date],
        respondedAt: Date
      },
      default: undefined
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    metadata: {
      bloodGroup: String,
      unitsNeeded: Number,
      hospitalName: String,
      urgencyLevel: String
    }
  },
  { timestamps: true }
);

// Indexes for performance
NotificationSchema.index({ recipientId: 1, status: 1 });
NotificationSchema.index({ requestId: 1 });
NotificationSchema.index({ expiresAt: 1 });
NotificationSchema.index({ createdAt: -1 });

// Auto-expire notifications
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const NotificationModel = model<NotificationDocument>('Notification', NotificationSchema);
