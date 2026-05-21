import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICandidate extends Document {
  jobId: mongoose.Types.ObjectId;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  resume: string; // Plain text details or simple text representation
  status: "applied" | "shortlisted" | "rejected" | "hired";
  interviewScore: number;
  notes?: string;
  createdAt: Date;
}

const CandidateSchema = new Schema<ICandidate>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    jobTitle: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    resume: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "hired"],
      default: "applied",
    },
    interviewScore: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

const Candidate: Model<ICandidate> =
  mongoose.models.Candidate ?? mongoose.model<ICandidate>("Candidate", CandidateSchema);

export default Candidate;
