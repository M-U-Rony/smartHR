import { createUser } from "@/lib/auth-store";
import { signupSchema } from "@/zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { message: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const { name, email, password, role } = result.data;

    const created = await createUser({ name, email, password, role });
    if (!created.ok) {
      return Response.json({ message: created.message }, { status: 409 });
    }

    return Response.json(
      {
        message: "Account created successfully.",
        user: { id: created.user.id, name: created.user.name, email: created.user.email, role: created.user.role },
      },
      { status: 201 },
    );
  } catch {
    return Response.json({ message: "Invalid request payload." }, { status: 400 });
  }
}
