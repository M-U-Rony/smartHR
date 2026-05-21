import { connectDB } from "@/db/mongoose";
import Attendance from "@/db/models/Attendance";
import Employee from "@/db/models/Employee";
import { attendanceSchema } from "@/zod";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const date = searchParams.get("date");
    const month = searchParams.get("month"); // Format: YYYY-MM

    if (email) {
      // Get attendance history for single employee
      const history = await Attendance.find({ employeeEmail: email.toLowerCase() }).sort({ date: -1 });
      return Response.json(history, { status: 200 });
    }

    if (date) {
      // Get attendance logs for specific date
      const logs = await Attendance.find({ date });
      return Response.json(logs, { status: 200 });
    }

    if (month) {
      // Generate monthly stats
      // Regex search for date starting with YYYY-MM
      const logs = await Attendance.find({ date: new RegExp(`^${month}`) });
      return Response.json(logs, { status: 200 });
    }

    // Default: return recent 100 logs
    const allLogs = await Attendance.find({}).sort({ date: -1 }).limit(100);
    return Response.json(allLogs, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to fetch attendance." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // We can handle both complete attendance records and incremental clock-in/out updates
    const { employeeEmail, date, status, clockIn, clockOut, note, isClockOutOnly } = body;

    if (!employeeEmail || !date) {
      return Response.json({ message: "Employee Email and Date are required." }, { status: 400 });
    }

    const emailKey = employeeEmail.toLowerCase().trim();

    // Check if the employee profile actually exists
    const employee = await Employee.findOne({ email: emailKey });
    if (!employee) {
      return Response.json({ message: "Employee profile not found for this email." }, { status: 404 });
    }

    // Find if there's an existing log for this date and employee
    const existingLog = await Attendance.findOne({ employeeEmail: emailKey, date });

    if (isClockOutOnly) {
      if (!existingLog) {
        return Response.json({ message: "No check-in record found for today." }, { status: 400 });
      }
      existingLog.clockOut = clockOut || new Date().toLocaleTimeString("en-US", { hour12: false });
      await existingLog.save();
      return Response.json(existingLog, { status: 200 });
    }

    if (existingLog) {
      // Update existing record
      if (status) existingLog.status = status;
      if (clockIn) existingLog.clockIn = clockIn;
      if (clockOut) existingLog.clockOut = clockOut;
      if (note !== undefined) existingLog.note = note;
      await existingLog.save();
      return Response.json(existingLog, { status: 200 });
    } else {
      // Create new record
      const newLog = await Attendance.create({
        employeeEmail: emailKey,
        date,
        status: status || "present",
        clockIn: clockIn || new Date().toLocaleTimeString("en-US", { hour12: false }),
        clockOut: clockOut || "",
        note: note || "",
      });
      return Response.json(newLog, { status: 201 });
    }
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to save attendance." }, { status: 500 });
  }
}
