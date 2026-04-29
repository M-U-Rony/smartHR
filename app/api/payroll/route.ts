import {
  createPayrollRecord,
  deletePayrollRecord,
  listPayrollRecords,
} from "@/lib/payroll-store";

type PayrollBody = {
  id?: string;
  employeeName?: string;
  baseSalary?: number;
  overtimeHours?: number;
  overtimeRate?: number;
  deduction?: number;
};

export async function GET() {
  return Response.json({ payroll: listPayrollRecords() }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PayrollBody;
    const employeeName = body.employeeName?.trim() ?? "";

    if (!employeeName) {
      return Response.json({ message: "Employee name is required." }, { status: 400 });
    }

    const created = createPayrollRecord({
      employeeName,
      baseSalary: Number(body.baseSalary ?? 0),
      overtimeHours: Number(body.overtimeHours ?? 0),
      overtimeRate: Number(body.overtimeRate ?? 0),
      deduction: Number(body.deduction ?? 0),
    });

    return Response.json({ record: created.record }, { status: 201 });
  } catch {
    return Response.json({ message: "Invalid request payload." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as PayrollBody;
    const id = body.id?.trim() ?? "";
    if (!id) {
      return Response.json({ message: "Id is required." }, { status: 400 });
    }

    const removed = deletePayrollRecord(id);
    if (!removed.ok) {
      return Response.json({ message: removed.message }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ message: "Invalid request payload." }, { status: 400 });
  }
}
