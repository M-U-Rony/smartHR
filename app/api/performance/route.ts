import {
  addPerformance,
  buildYearlyReport,
  deletePerformance,
  listPerformance,
} from "@/lib/performance-store";

type PerformanceBody = {
  id?: string;
  employeeName?: string;
  year?: number;
  rating?: number;
  comments?: string;
};

export async function GET() {
  return Response.json(
    {
      records: listPerformance(),
      yearlyReport: buildYearlyReport(),
    },
    { status: 200 },
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PerformanceBody;
    const employeeName = body.employeeName?.trim() ?? "";
    const year = Number(body.year ?? 0);
    const rating = Number(body.rating ?? 0);
    const comments = body.comments?.trim() ?? "";

    if (!employeeName || !year || !rating || !comments) {
      return Response.json(
        { message: "Employee name, year, rating, and comments are required." },
        { status: 400 },
      );
    }

    if (rating < 1 || rating > 5) {
      return Response.json({ message: "Rating must be between 1 and 5." }, { status: 400 });
    }

    const created = addPerformance({ employeeName, year, rating, comments });
    return Response.json({ record: created.record }, { status: 201 });
  } catch {
    return Response.json({ message: "Invalid request payload." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as PerformanceBody;
    const id = body.id?.trim() ?? "";
    if (!id) {
      return Response.json({ message: "Id is required." }, { status: 400 });
    }

    const removed = deletePerformance(id);
    if (!removed.ok) {
      return Response.json({ message: removed.message }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ message: "Invalid request payload." }, { status: 400 });
  }
}
