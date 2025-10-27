import { Schema, model, Document, Types } from 'mongoose';

export interface AppointmentDocument extends Document {
  // Core fields
  donorId: Types.ObjectId;
  requestId?: Types.ObjectId; // Optional - for reactive donations
  notificationId?: Types.ObjectId; // Link to notification that triggered this
  
  // Scheduling
  scheduledDate: Date;
  scheduledTime: string; // "10:00" format
  estimatedDuration: number; // minutes
  
  // Location
  location: string;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  
  // Status
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  
  // Donation details
  bloodGroup: string;
  unitsExpected: number;
  unitsCollected?: number;
  
  // Notes and communication
  donorNotes?: string; // Notes from donor when booking
  adminNotes?: string; // Admin notes
  cancellationReason?: string;
  
  // Confirmation and reminders
  confirmedAt?: Date;
  reminderSentAt?: Date;
  
  // Completion details
  completedAt?: Date;
  donationRecordId?: Types.ObjectId; // Link to actual donation record
  
  // Metadata
  createdBy: Types.ObjectId; // Admin who created
  type: 'reactive' | 'proactive' | 'walk_in'; // How this appointment was created
}

const AppointmentSchema = new Schema<AppointmentDocument>(
  {
    donorId: { type: Schema.Types.ObjectId, ref: 'Donor', required: true },
    requestId: { type: Schema.Types.ObjectId, ref: 'Request' },
    notificationId: { type: Schema.Types.ObjectId, ref: 'Notification' },
    
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, required: true },
    estimatedDuration: { type: Number, default: 45 },
    
    location: { type: String, required: true },
    address: String,
    contactPerson: String,
    contactPhone: String,
    
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled'
    },
    
    bloodGroup: { type: String, required: true },
    unitsExpected: { type: Number, default: 1 },
    unitsCollected: Number,
    
    donorNotes: String,
    adminNotes: String,
    cancellationReason: String,
    
    confirmedAt: Date,
    reminderSentAt: Date,
    completedAt: Date,
    donationRecordId: { type: Schema.Types.ObjectId, ref: 'Donation' },
    
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['reactive', 'proactive', 'walk_in'],
      default: 'reactive'
    }
  },
  { timestamps: true }
);

// Indexes for performance
AppointmentSchema.index({ donorId: 1, scheduledDate: 1 });
AppointmentSchema.index({ requestId: 1 });
AppointmentSchema.index({ status: 1, scheduledDate: 1 });
AppointmentSchema.index({ scheduledDate: 1, status: 1 });

// Methods
AppointmentSchema.methods.isUpcoming = function() {
  const appointmentDateTime = new Date(this.scheduledDate);
  const [hours, minutes] = this.scheduledTime.split(':');
  appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
  
  return appointmentDateTime > new Date() && ['scheduled', 'confirmed'].includes(this.status);
};

AppointmentSchema.methods.canCancel = function() {
  const appointmentDateTime = new Date(this.scheduledDate);
  const [hours, minutes] = this.scheduledTime.split(':');
  appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
  
  const hoursUntilAppointment = (appointmentDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);
  return hoursUntilAppointment > 2 && ['scheduled', 'confirmed'].includes(this.status);
};

export const AppointmentModel = model<AppointmentDocument>('Appointment', AppointmentSchema);
