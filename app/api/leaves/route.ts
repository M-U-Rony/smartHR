import { LeaveStatus, applyLeave, listLeaves, reviewLeave } from "@/lib/leave-store";

type LeaveBody = {
  id?: string;
  employeeName?: string;
  fromDate?: string;
  toDate?: string;
  reason?: string;
  status?: string;
};

function isValidReviewStatus(status: string): status is LeaveStatus {
  return status === "approved" || status === "rejected";
}

export async function GET() {
  return Response.json({ leaves: listLeaves() }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LeaveBody;
    const employeeName = body.employeeName?.trim() ?? "";
    const fromDate = body.fromDate?.trim() ?? "";
    const toDate = body.toDate?.trim() ?? "";
    const reason = body.reason?.trim() ?? "";

    if (!employeeName || !fromDate || !toDate || !reason) {
      return Response.json(
        { message: "Employee name, from date, to date, and reason are required." },
        { status: 400 },
      );
    }

    const created = applyLeave({ employeeName, fromDate, toDate, reason });
    return Response.json({ leave: created.leave }, { status: 201 });
  } catch {
    return Response.json({ message: "Invalid request payload." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as LeaveBody;
    const id = body.id?.trim() ?? "";
    const status = body.status?.trim().toLowerCase() ?? "";

    if (!id || !status) {
      return Response.json({ message: "Id and status are required." }, { status: 400 });
    }

    if (!isValidReviewStatus(status)) {
      return Response.json({ message: "Status must be approved or rejected." }, { status: 400 });
    }

    const reviewed = reviewLeave({ id, status });
    if (!reviewed.ok) {
      return Response.json({ message: reviewed.message }, { status: reviewed.status });
    }

    return Response.json({ leave: reviewed.leave }, { status: 200 });
  } catch {
    return Response.json({ message: "Invalid request payload." }, { status: 400 });
  }
}
