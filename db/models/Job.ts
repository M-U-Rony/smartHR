import mongoose, { Schema, Document, Model } from "mongoose";

export interface IJob extends Document {
  title: string;
  department: string;
  description: string;
  requirements: string;
  status: "active" | "closed";
  createdAt: Date;
}

const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    requirements: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "closed"], default: "active" },
  },
  { timestamps: true }
);

const Job: Model<IJob> =
  mongoose.models.Job ?? mongoose.model<IJob>("Job", JobSchema);

export default Job;
