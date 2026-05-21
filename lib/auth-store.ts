import bcrypt from "bcryptjs";
import { connectDB } from "@/db/mongoose";
import User from "@/db/models/User";

export async function createUser(payload: { name: string; email: string; password: string; role?: "ADMIN" | "EMPLOYEE" }) {
  await connectDB();

  const existing = await User.findOne({ email: payload.email.toLowerCase().trim() });
  if (existing) {
    return { ok: false as const, message: "An account with this email already exists." };
  }

  const hashed = await bcrypt.hash(payload.password, 12);
  const user = await User.create({
    name: payload.name.trim(),
    email: payload.email.toLowerCase().trim(),
    password: hashed,
    role: payload.role || "EMPLOYEE",
  });

  return {
    ok: true as const,
    user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
  };
}

export async function verifyUser(payload: { email: string; password: string }) {
  await connectDB();

  const user = await User.findOne({ email: payload.email.toLowerCase().trim() });
  if (!user) {
    return { ok: false as const, message: "Invalid email or password." };
  }

  const match = await bcrypt.compare(payload.password, user.password);
  if (!match) {
    return { ok: false as const, message: "Invalid email or password." };
  }

  return {
    ok: true as const,
    user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
  };
}
