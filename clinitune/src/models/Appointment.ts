import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  _id: string;
  clinicianId: string;
  patientId: string;
  date: Date;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  clinicianId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  type: { type: String, required: true, default: 'Consultation' },
  status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
  notes: { type: String },
}, {
  timestamps: true,
});

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);