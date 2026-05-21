import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttendance extends Document {
  employeeEmail: string;
  date: string; // YYYY-MM-DD
  status: "present" | "late" | "absent";
  clockIn?: string; // HH:MM:SS
  clockOut?: string; // HH:MM:SS
  note?: string;
  createdAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    employeeEmail: { type: String, required: true, lowercase: true, trim: true },
    date: { type: String, required: true },
    status: { type: String, enum: ["present", "late", "absent"], required: true },
    clockIn: { type: String },
    clockOut: { type: String },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

// Compound index so that we don't have multiple attendance entries for same day for same employee
AttendanceSchema.index({ employeeEmail: 1, date: 1 }, { unique: true });

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance ?? mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
