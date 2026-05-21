import { connectDB } from "@/db/mongoose";
import Employee from "@/db/models/Employee";
import Attendance from "@/db/models/Attendance";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const month = searchParams.get("month"); // Format: YYYY-MM

    if (!email || !month) {
      return Response.json({ message: "Employee Email and Month are required." }, { status: 400 });
    }

    const emailKey = email.toLowerCase().trim();

    // Check if the employee profile exists
    const employee = await Employee.findOne({ email: emailKey });
    if (!employee) {
      return Response.json({ message: "Employee profile not found." }, { status: 404 });
    }

    // Query attendance records matching this month (date starting with YYYY-MM)
    const logs = await Attendance.find({
      employeeEmail: emailKey,
      date: new RegExp(`^${month}`),
    });

    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;
    let totalOvertimeHours = 0;

    for (const log of logs) {
      if (log.status === "present") {
        presentCount++;
      } else if (log.status === "late") {
        lateCount++;
      } else if (log.status === "absent") {
        absentCount++;
      }

      // Overtime calculation: clockOut after 17:00:00 (5:00 PM)
      if (log.clockOut) {
        const parts = log.clockOut.split(":");
        if (parts.length >= 2) {
          const hours = Number(parts[0]) || 0;
          const minutes = Number(parts[1]) || 0;
          const seconds = Number(parts[2]) || 0;
          
          const totalSeconds = hours * 3600 + minutes * 60 + seconds;
          const standardSeconds = 17 * 3600; // 17:00:00 standard shift end

          if (totalSeconds > standardSeconds) {
            const diffSeconds = totalSeconds - standardSeconds;
            totalOvertimeHours += diffSeconds / 3600;
          }
        }
      }
    }

    // Calculations based on rules:
    const salary = employee.salary;

    // Overtime hourly rate: standard base salary / 176 standard working hours per month * 1.5 overtime factor
    const estimatedOvertimeRate = Math.round((salary / 176) * 1.5);

    // Deductions: Daily wage (Base Salary / 22 working days) per absence + flat $10 fine per late clock-in
    const dailyWage = salary / 22;
    const absenceDeduction = absentCount * dailyWage;
    const lateDeduction = lateCount * 10;
    const totalDeductions = Math.round((absenceDeduction + lateDeduction) * 100) / 100;

    const totalOvertimeHoursRounded = Math.round(totalOvertimeHours * 100) / 100;

    return Response.json({
      overtimeHours: totalOvertimeHoursRounded,
      overtimeRate: estimatedOvertimeRate,
      deductions: totalDeductions,
      attendanceSummary: {
        present: presentCount,
        late: lateCount,
        absent: absentCount,
      },
    }, { status: 200 });

  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to calculate payroll automatically." }, { status: 500 });
  }
}
