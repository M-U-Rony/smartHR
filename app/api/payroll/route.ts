import { connectDB } from "@/db/mongoose";
import Payroll from "@/db/models/Payroll";
import Employee from "@/db/models/Employee";
import { payrollSchema } from "@/zod";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const month = searchParams.get("month");

    if (email) {
      const records = await Payroll.find({ employeeEmail: email.toLowerCase() }).sort({ month: -1 });
      return Response.json(records, { status: 200 });
    }

    if (month) {
      const records = await Payroll.find({ month }).sort({ employeeName: 1 });
      return Response.json(records, { status: 200 });
    }

    const allRecords = await Payroll.find({}).sort({ month: -1 });
    return Response.json(allRecords, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to fetch payroll records." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // Custom check since body requires base salary from Employee
    const { employeeEmail, month, overtimeHours, overtimeRate, deductions, status } = body;

    if (!employeeEmail || !month) {
      return Response.json({ message: "Employee Email and Month are required." }, { status: 400 });
    }

    const employee = await Employee.findOne({ email: employeeEmail.toLowerCase().trim() });
    if (!employee) {
      return Response.json({ message: "Employee profile not found." }, { status: 404 });
    }

    const baseSalary = employee.salary;
    const oth = Number(overtimeHours) || 0;
    const otr = Number(overtimeRate) || 0;
    const ded = Number(deductions) || 0;
    
    // Calculate net salary
    const netSalary = Math.max(0, baseSalary + (oth * otr) - ded);

    // Upsert payroll (update if exists, insert if new)
    const payroll = await Payroll.findOneAndUpdate(
      { employeeEmail: employee.email, month },
      {
        employeeName: employee.name,
        baseSalary,
        overtimeHours: oth,
        overtimeRate: otr,
        deductions: ded,
        netSalary,
        status: status || "pending",
      },
      { new: true, upsert: true }
    );

    return Response.json(payroll, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to generate payroll." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return Response.json({ message: "Payroll ID and status are required." }, { status: 400 });
    }

    const payroll = await Payroll.findById(id);
    if (!payroll) {
      return Response.json({ message: "Payroll record not found." }, { status: 404 });
    }

    payroll.status = status;
    await payroll.save();

    return Response.json(payroll, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to update payroll status." }, { status: 500 });
  }
}
