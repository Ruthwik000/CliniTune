import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAIChat extends Document {
  _id: string;
  patientId: Types.ObjectId;
  messages: Array<{
    sender: 'ai' | 'patient';
    text: string;
    timestamp: Date;
  }>;
  summary: string;
  alertLevel: 'none' | 'low' | 'medium' | 'high';
  concerns: string[];
  emotionalState: string;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AIChatSchema = new Schema<IAIChat>({
  patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    sender: { type: String, enum: ['ai', 'patient'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
  summary: { type: String, default: '' },
  alertLevel: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'none' },
  concerns: [{ type: String }],
  emotionalState: { type: String, default: 'stable' },
  lastUpdated: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

export default mongoose.models.AIChat || mongoose.model<IAIChat>('AIChat', AIChatSchema);