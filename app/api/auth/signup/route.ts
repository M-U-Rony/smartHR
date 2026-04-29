import { createUser } from "@/lib/auth-store";

type SignupBody = {
  name?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupBody;
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";

    if (!name || !email || !password) {
      return Response.json(
        { message: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return Response.json(
        { message: "Password must be at least 6 characters long." },
        { status: 400 },
      );
    }

    const created = createUser({ name, email, password });
    if (!created.ok) {
      return Response.json({ message: created.message }, { status: 409 });
    }

    return Response.json(
      {
        message: "Account created successfully.",
        user: {
          id: created.user.id,
          name: created.user.name,
          email: created.user.email,
        },
      },
      { status: 201 },
    );
  } catch {
    return Response.json({ message: "Invalid request payload." }, { status: 400 });
  }
}
