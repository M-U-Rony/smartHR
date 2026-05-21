import { connectDB } from "@/db/mongoose";
import Leave from "@/db/models/Leave";
import Employee from "@/db/models/Employee";
import { leaveSchema, leaveReviewSchema } from "@/zod";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (email) {
      const leaves = await Leave.find({ employeeEmail: email.toLowerCase() }).sort({ createdAt: -1 });
      return Response.json(leaves, { status: 200 });
    }

    const allLeaves = await Leave.find({}).sort({ createdAt: -1 });
    return Response.json(allLeaves, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to fetch leave requests." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const result = leaveSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const { employeeName, fromDate, toDate, reason } = result.data;
    
    // We need employeeEmail from request body since employeeName is validated, but let's read employeeEmail
    const employeeEmail = body.employeeEmail?.toLowerCase().trim();
    if (!employeeEmail) {
      return Response.json({ message: "Employee Email is required." }, { status: 400 });
    }

    const employee = await Employee.findOne({ email: employeeEmail });
    if (!employee) {
      return Response.json({ message: "Employee profile not found." }, { status: 404 });
    }

    // Calculate days between fromDate and toDate
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check if remaining leaves are sufficient
    const remaining = employee.totalLeaves - employee.leavesUsed;
    if (diffDays > remaining) {
      return Response.json({ message: `Insufficient leave balance. You only have ${remaining} days left.` }, { status: 400 });
    }

    const leaveRequest = await Leave.create({
      employeeEmail,
      employeeName: employee.name,
      fromDate,
      toDate,
      reason,
      days: diffDays,
      status: "pending",
    });

    return Response.json(leaveRequest, { status: 201 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to submit leave request." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const result = leaveReviewSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const { id, status } = result.data;

    const leave = await Leave.findById(id);
    if (!leave) {
      return Response.json({ message: "Leave request not found." }, { status: 404 });
    }

    if (leave.status !== "pending") {
      return Response.json({ message: "This leave request has already been processed." }, { status: 400 });
    }

    if (status === "approved") {
      const employee = await Employee.findOne({ email: leave.employeeEmail });
      if (employee) {
        employee.leavesUsed += leave.days;
        await employee.save();
      }
    }

    leave.status = status;
    await leave.save();

    return Response.json(leave, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to update leave request." }, { status: 500 });
  }
}
