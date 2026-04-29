import {
  createEmployee,
  deleteEmployee,
  listEmployees,
  updateEmployee,
} from "@/lib/employee-store";

type EmployeeBody = {
  id?: string;
  name?: string;
  email?: string;
  department?: string;
};

export async function GET() {
  return Response.json({ employees: listEmployees() }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EmployeeBody;
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const department = body.department?.trim() ?? "";

    if (!name || !email || !department) {
      return Response.json(
        { message: "Name, email, and department are required." },
        { status: 400 },
      );
    }

    const created = createEmployee({ name, email, department });
    if (!created.ok) {
      return Response.json({ message: created.message }, { status: 409 });
    }

    return Response.json({ employee: created.employee }, { status: 201 });
  } catch {
    return Response.json({ message: "Invalid request payload." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as EmployeeBody;
    const id = body.id?.trim() ?? "";
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const department = body.department?.trim() ?? "";

    if (!id || !name || !email || !department) {
      return Response.json(
        { message: "Id, name, email, and department are required." },
        { status: 400 },
      );
    }

    const updated = updateEmployee({ id, name, email, department });
    if (!updated.ok) {
      return Response.json({ message: updated.message }, { status: updated.status });
    }

    return Response.json({ employee: updated.employee }, { status: 200 });
  } catch {
    return Response.json({ message: "Invalid request payload." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as EmployeeBody;
    const id = body.id?.trim() ?? "";
    if (!id) {
      return Response.json({ message: "Id is required." }, { status: 400 });
    }

    const removed = deleteEmployee(id);
    if (!removed.ok) {
      return Response.json({ message: removed.message }, { status: 404 });
    }

    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ message: "Invalid request payload." }, { status: 400 });
  }
}
