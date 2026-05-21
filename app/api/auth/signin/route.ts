import { verifyUser } from "@/lib/auth-store";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { signinSchema } from "@/zod";

const JWT_SECRET = process.env.JWT_Secret as string;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = signinSchema.safeParse(body);

    if (!result.success) {
      return Response.json({ message: result.error.issues[0].message }, { status: 400 });
    }

    const { email, password } = result.data;

    const verified = await verifyUser({ email, password });
    if (!verified.ok) {
      return Response.json({ message: verified.message }, { status: 401 });
    }

    const token = jwt.sign(
      { id: verified.user.id, name: verified.user.name, email: verified.user.email, role: verified.user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      {
        message: "Signed in successfully.",
        user: { id: verified.user.id, name: verified.user.name, email: verified.user.email, role: verified.user.role },
      },
      { status: 200 }
    );

    response.cookies.set("smarthr_session", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return Response.json({ message: "Invalid request payload." }, { status: 400 });
  }
}
