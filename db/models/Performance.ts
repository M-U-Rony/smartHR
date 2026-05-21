import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPerformance extends Document {
  employeeEmail: string;
  employeeName: string;
  year: number;
  rating: number; // 1-5 stars
  comments: string;
  reviewedBy: string; // Evaluator name/email
  createdAt: Date;
}

const PerformanceSchema = new Schema<IPerformance>(
  {
    employeeEmail: { type: String, required: true, lowercase: true, trim: true },
    employeeName: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comments: { type: String, required: true, trim: true },
    reviewedBy: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Performance: Model<IPerformance> =
  mongoose.models.Performance ?? mongoose.model<IPerformance>("Performance", PerformanceSchema);

export default Performance;
