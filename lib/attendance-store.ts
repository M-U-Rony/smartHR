export type AttendanceStatus = "present" | "absent" | "late";

export type AttendanceRecord = {
  id: string;
  employeeName: string;
  date: string;
  status: AttendanceStatus;
  note: string;
  createdAt: string;
};

const recordsById = new Map<string, AttendanceRecord>();

function normalizeDate(date: string) {
  return date.trim();
}

export function listAttendance() {
  return Array.from(recordsById.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createAttendance(payload: {
  employeeName: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
}) {
  const record: AttendanceRecord = {
    id: crypto.randomUUID(),
    employeeName: payload.employeeName.trim(),
    date: normalizeDate(payload.date),
    status: payload.status,
    note: payload.note?.trim() ?? "",
    createdAt: new Date().toISOString(),
  };

  recordsById.set(record.id, record);
  return { ok: true as const, record };
}

export function updateAttendance(payload: {
  id: string;
  employeeName: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
}) {
  const record = recordsById.get(payload.id);
  if (!record) {
    return { ok: false as const, status: 404, message: "Attendance record not found." };
  }

  const updated: AttendanceRecord = {
    ...record,
    employeeName: payload.employeeName.trim(),
    date: normalizeDate(payload.date),
    status: payload.status,
    note: payload.note?.trim() ?? "",
  };

  recordsById.set(updated.id, updated);
  return { ok: true as const, record: updated };
}

export function deleteAttendance(id: string) {
  const removed = recordsById.delete(id);
  if (!removed) {
    return { ok: false as const, message: "Attendance record not found." };
  }

  return { ok: true as const };
}
