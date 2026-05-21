import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILeave extends Document {
  employeeEmail: string;
  employeeName: string;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  reason: string;
  status: "pending" | "approved" | "rejected";
  days: number;
  createdAt: Date;
}

const LeaveSchema = new Schema<ILeave>(
  {
    employeeEmail: { type: String, required: true, lowercase: true, trim: true },
    employeeName: { type: String, required: true, trim: true },
    fromDate: { type: String, required: true },
    toDate: { type: String, required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    days: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

const Leave: Model<ILeave> =
  mongoose.models.Leave ?? mongoose.model<ILeave>("Leave", LeaveSchema);

export default Leave;
