export type UserRecord = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

const usersByEmail = new Map<string, UserRecord>();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function createUser(payload: { name: string; email: string; password: string }) {
  const email = normalizeEmail(payload.email);
  if (usersByEmail.has(email)) {
    return { ok: false as const, message: "An account with this email already exists." };
  }

  const user: UserRecord = {
    id: crypto.randomUUID(),
    name: payload.name.trim(),
    email,
    password: payload.password,
    createdAt: new Date().toISOString(),
  };

  usersByEmail.set(email, user);
  return { ok: true as const, user };
}

export function verifyUser(payload: { email: string; password: string }) {
  const email = normalizeEmail(payload.email);
  const user = usersByEmail.get(email);
  if (!user || user.password !== payload.password) {
    return { ok: false as const, message: "Invalid email or password." };
  }

  return { ok: true as const, user };
}
