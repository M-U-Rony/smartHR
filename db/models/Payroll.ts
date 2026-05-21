import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayroll extends Document {
  employeeEmail: string;
  employeeName: string;
  month: string; // YYYY-MM
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  deductions: number;
  netSalary: number;
  status: "paid" | "pending";
  createdAt: Date;
}

const PayrollSchema = new Schema<IPayroll>(
  {
    employeeEmail: { type: String, required: true, lowercase: true, trim: true },
    employeeName: { type: String, required: true, trim: true },
    month: { type: String, required: true },
    baseSalary: { type: Number, required: true, min: 0 },
    overtimeHours: { type: Number, default: 0, min: 0 },
    overtimeRate: { type: Number, default: 0, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    netSalary: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["paid", "pending"], default: "pending" },
  },
  { timestamps: true }
);

// Unique index so that there is only one payroll per employee per month
PayrollSchema.index({ employeeEmail: 1, month: 1 }, { unique: true });

const Payroll: Model<IPayroll> =
  mongoose.models.Payroll ?? mongoose.model<IPayroll>("Payroll", PayrollSchema);

export default Payroll;
