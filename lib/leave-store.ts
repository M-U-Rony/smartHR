export type LeaveStatus = "pending" | "approved" | "rejected";

export type LeaveRecord = {
  id: string;
  employeeName: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
};

const leavesById = new Map<string, LeaveRecord>();

export function listLeaves() {
  return Array.from(leavesById.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function applyLeave(payload: {
  employeeName: string;
  fromDate: string;
  toDate: string;
  reason: string;
}) {
  const leave: LeaveRecord = {
    id: crypto.randomUUID(),
    employeeName: payload.employeeName.trim(),
    fromDate: payload.fromDate.trim(),
    toDate: payload.toDate.trim(),
    reason: payload.reason.trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  leavesById.set(leave.id, leave);
  return { ok: true as const, leave };
}

export function reviewLeave(payload: { id: string; status: LeaveStatus }) {
  const leave = leavesById.get(payload.id);
  if (!leave) {
    return { ok: false as const, status: 404, message: "Leave request not found." };
  }

  if (payload.status === "pending") {
    return { ok: false as const, status: 400, message: "Review status must be approved or rejected." };
  }

  const updated: LeaveRecord = {
    ...leave,
    status: payload.status,
  };

  leavesById.set(updated.id, updated);
  return { ok: true as const, leave: updated };
}
