import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_Secret as string;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("smarthr_session")?.value;

    if (!token) {
      return Response.json({ message: "Not authenticated." }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      name: string;
      email: string;
      role: "ADMIN" | "EMPLOYEE";
    };

    return Response.json({ user: decoded }, { status: 200 });
  } catch {
    return Response.json({ message: "Invalid session." }, { status: 401 });
  }
}
