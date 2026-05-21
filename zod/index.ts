import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(["ADMIN", "EMPLOYEE"]).optional().default("EMPLOYEE"),
});

export const signinSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const employeeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  salary: z.coerce.number().min(0, "Salary must be positive"),
});

export const attendanceSchema = z.object({
  id: z.string().optional(),
  employeeId: z.string().min(1, "Employee ID is required"),
  date: z.string().min(1, "Date is required"),
  status: z.enum(["present", "absent", "late"]),
  note: z.string().optional(),
  clockIn: z.string().optional(),
  clockOut: z.string().optional(),
});

export const leaveSchema = z.object({
  id: z.string().optional(),
  employeeName: z.string().min(1, "Employee name is required"),
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().min(1, "To date is required"),
  reason: z.string().min(1, "Reason is required"),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

export const leaveReviewSchema = z.object({
  id: z.string().min(1, "Id is required"),
  status: z.enum(["approved", "rejected"]),
});

export const payrollSchema = z.object({
  id: z.string().optional(),
  employeeName: z.string().min(1, "Employee name is required"),
  baseSalary: z.number().min(0, "Base salary must be non-negative").optional().default(0),
  overtimeHours: z.number().min(0, "Overtime hours must be non-negative").optional().default(0),
  overtimeRate: z.number().min(0, "Overtime rate must be non-negative").optional().default(0),
  deduction: z.number().min(0, "Deduction must be non-negative").optional().default(0),
});

export const performanceSchema = z.object({
  id: z.string().optional(),
  employeeName: z.string().min(1, "Employee name is required"),
  year: z.number().min(1900, "Invalid year"),
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
  comments: z.string().min(1, "Comments are required"),
});

export const postJobSchema = z.object({
  action: z.literal("post-job"),
  title: z.string().min(1, "Title is required"),
  department: z.string().min(1, "Department is required"),
  description: z.string().min(1, "Description is required"),
});

export const applyCandidateSchema = z.object({
  action: z.literal("apply"),
  jobId: z.string().min(1, "Job ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  resume: z.string().min(1, "Resume is required"),
});

export const shortlistCandidateSchema = z.object({
  action: z.literal("shortlist"),
  candidateId: z.string().min(1, "Candidate ID is required"),
});

export const recruitmentSchema = z.discriminatedUnion("action", [
  postJobSchema,
  applyCandidateSchema,
  shortlistCandidateSchema,
]);

export const deleteSchema = z.object({
  id: z.string().min(1, "Id is required"),
});
