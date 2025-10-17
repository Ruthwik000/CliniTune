import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'clinician' | 'patient';
  assignedPatients?: string[];
  assignedClinician?: string;
  specialization?: string;
  licenseNumber?: string;
  preferences?: {
    notifications?: {
      emailAlerts?: boolean;
      taskReminders?: boolean;
      appointmentReminders?: boolean;
      aiAlerts?: boolean;
      appointments?: boolean;
      tasks?: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['clinician', 'patient'], required: true },
  assignedPatients: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  assignedClinician: { type: Schema.Types.ObjectId, ref: 'User' },
  specialization: { type: String },
  licenseNumber: { type: String },
  preferences: {
    notifications: {
      emailAlerts: { type: Boolean, default: true },
      taskReminders: { type: Boolean, default: true },
      appointmentReminders: { type: Boolean, default: true },
      aiAlerts: { type: Boolean, default: true },
      appointments: { type: Boolean, default: true },
      tasks: { type: Boolean, default: true },
    }
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);