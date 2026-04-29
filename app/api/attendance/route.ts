import {
  AttendanceStatus,
  createAttendance,
  deleteAttendance,
  listAttendance,
  updateAttendance,
} from "@/lib/attendance-store";

type AttendanceBody = {
  id?: string;
  employeeName?: string;
  date?: string;
  status?: string;
  note?: string;
};

const validStatuses: AttendanceStatus[] = ["present", "absent", "late"];

function isValidStatus(status: string): status is AttendanceStatus {
  return validStatuses.includes(status as AttendanceStatus);
}

export async function GET() {
  return Response.json({ attendance: listAttendance() }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AttendanceBody;
    const employeeName = body.employeeName?.trim() ?? "";
    const date = body.date?.trim() ?? "";
    const status = body.status?.trim().toLowerCase() ?? "";
    const note = body.note?.trim() ?? "";

    if (!employeeName || !date || !status) {
      return Response.json(
        { message: "Employee name, date, and status are required." },
        { status: 400 },
      );
    }

    if (!isValidStatus(status)) {
      return Response.json({ message: "Status must be present, absent, or late." }, { status: 400 });
    }

    const created = createAttendance({ employeeName, date, status, note });
    return Response.json({ record: created.record }, { status: 201 });
  } catch {
    return Response.json({ message: "Invalid request payload." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as AttendanceBody;
    const id = body.id?.trim() ?? "";
    const employeeName = body.employeeName?.trim() ?? "";
    const date = body.date?.trim() ?? "";
    const status = body.status?.trim().toLowerCase() ?? "";
    const note = body.note?.trim() ?? "";

    if (!id || !employeeName || !date || !status) {
      return Response.json(
        { message: "Id, employee name, date, and status are required." },
        { status: 400 },
      );
    }

    if (!isValidStatus(status)) {
      return Response.json({ message: "Status must be present, absent, or late." }, { status: 400 });
    }

    const updated = updateAttendance({ id, employeeName, date, status, note });
    if (!updated.ok) {
      return Response.json({ message: updated.message }, { status: updated.status });
    }

    return Response.json({ record: updated.record }, { status: 200 });
  } catch {
    return Response.json({ message: "Invalid request payload." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as AttendanceBody;
    const id = body.id?.trim() ?? "";
    if (!id) {
      return Response.json({ message: "Id is required." }, { status: 400 });
    }

    const removed = deleteAttendance(id);
    if (!removed.ok) {
      return Response.json({ message: removed.message }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ message: "Invalid request payload." }, { status: 400 });
  }
}
