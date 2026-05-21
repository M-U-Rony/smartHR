import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEmployee extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  designation: string;
  department: string;
  salary: number;
  joinedDate: Date;
  totalLeaves: number;
  leavesUsed: number;
  createdAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    designation: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    salary: { type: Number, required: true, min: 0 },
    joinedDate: { type: Date, default: Date.now },
    totalLeaves: { type: Number, default: 20 },
    leavesUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Employee: Model<IEmployee> =
  mongoose.models.Employee ?? mongoose.model<IEmployee>("Employee", EmployeeSchema);

export default Employee;
