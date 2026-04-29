export type EmployeeRecord = {
  id: string;
  name: string;
  email: string;
  department: string;
  createdAt: string;
};

const employeesById = new Map<string, EmployeeRecord>();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hasEmailConflict(email: string, excludeId?: string) {
  const normalizedEmail = normalizeEmail(email);
  for (const employee of employeesById.values()) {
    if (employee.id !== excludeId && employee.email === normalizedEmail) {
      return true;
    }
  }
  return false;
}

export function listEmployees() {
  return Array.from(employeesById.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createEmployee(payload: { name: string; email: string; department: string }) {
  if (hasEmailConflict(payload.email)) {
    return { ok: false as const, message: "An employee with this email already exists." };
  }

  const employee: EmployeeRecord = {
    id: crypto.randomUUID(),
    name: payload.name.trim(),
    email: normalizeEmail(payload.email),
    department: payload.department.trim(),
    createdAt: new Date().toISOString(),
  };

  employeesById.set(employee.id, employee);
  return { ok: true as const, employee };
}

export function updateEmployee(payload: {
  id: string;
  name: string;
  email: string;
  department: string;
}) {
  const employee = employeesById.get(payload.id);
  if (!employee) {
    return { ok: false as const, status: 404, message: "Employee not found." };
  }

  if (hasEmailConflict(payload.email, payload.id)) {
    return { ok: false as const, status: 409, message: "Another employee already uses this email." };
  }

  const updated: EmployeeRecord = {
    ...employee,
    name: payload.name.trim(),
    email: normalizeEmail(payload.email),
    department: payload.department.trim(),
  };

  employeesById.set(updated.id, updated);
  return { ok: true as const, employee: updated };
}

export function deleteEmployee(id: string) {
  const removed = employeesById.delete(id);
  if (!removed) {
    return { ok: false as const, message: "Employee not found." };
  }

  return { ok: true as const };
}
