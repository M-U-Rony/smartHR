import { connectDB } from "@/db/mongoose";
import Employee from "@/db/models/Employee";
import User from "@/db/models/User";
import { employeeSchema, deleteSchema } from "@/zod";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectDB();
    const employees = await Employee.find({}).sort({ name: 1 });
    return Response.json(employees, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to fetch employees." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const result = employeeSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const { name, email, phone, department, position, salary } = result.data;

    // Check if employee with email already exists
    const existing = await Employee.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return Response.json({ message: "An employee with this email already exists." }, { status: 400 });
    }

    // Create Employee profile
    const employee = await Employee.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || "",
      designation: position.trim(),
      department: department.trim(),
      salary: salary,
      totalLeaves: 20,
      leavesUsed: 0,
    });

    // Create User login account if it doesn't exist
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash("123456", 12);
      await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: "EMPLOYEE",
      });
    }

    return Response.json(employee, { status: 201 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to create employee." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const result = employeeSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const { id, name, email, phone, department, position, salary } = result.data;

    if (!id) {
      return Response.json({ message: "Employee ID is required for updates." }, { status: 400 });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return Response.json({ message: "Employee not found." }, { status: 404 });
    }

    // Update Employee profile
    employee.name = name.trim();
    employee.phone = phone || "";
    employee.designation = position.trim();
    employee.department = department.trim();
    employee.salary = salary;
    await employee.save();

    // Sync name in User model if applicable
    await User.findOneAndUpdate({ email: employee.email }, { name: name.trim() });

    return Response.json(employee, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to update employee." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ message: "Employee ID is required." }, { status: 400 });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return Response.json({ message: "Employee not found." }, { status: 404 });
    }

    // Delete Employee profile and user login account
    await Employee.findByIdAndDelete(id);
    await User.findOneAndDelete({ email: employee.email });

    return Response.json({ message: "Employee deleted successfully." }, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to delete employee." }, { status: 500 });
  }
}
