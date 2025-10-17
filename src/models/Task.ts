import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITask extends Document {
  _id: string;
  title: string;
  description: string;
  patientId: Types.ObjectId | string;
  clinicianId: Types.ObjectId | string;
  completed: boolean;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  clinicianId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date, required: true },
}, {
  timestamps: true,
});

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);