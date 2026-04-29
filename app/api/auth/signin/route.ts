import { verifyUser } from "@/lib/auth-store";
import { NextResponse } from "next/server";

type SigninBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SigninBody;
    const email = body.email?.trim() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return Response.json({ message: "Email and password are required." }, { status: 400 });
    }

    const verified = verifyUser({ email, password });
    if (!verified.ok) {
      return Response.json({ message: verified.message }, { status: 401 });
    }

    const response = NextResponse.json(
      {
        message: "Signed in successfully.",
        user: {
          id: verified.user.id,
          name: verified.user.name,
          email: verified.user.email,
        },
      },
      { status: 200 },
    );

    response.cookies.set("smarthr_session", verified.user.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch {
    return Response.json({ message: "Invalid request payload." }, { status: 400 });
  }
}
