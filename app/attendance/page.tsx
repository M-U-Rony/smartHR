"use client";

import { FormEvent, useEffect, useState } from "react";

type AttendanceStatus = "present" | "absent" | "late";

type AttendanceRecord = {
  id: string;
  employeeName: string;
  date: string;
  status: AttendanceStatus;
  note: string;
  createdAt: string;
};

type FormState = {
  employeeName: string;
  date: string;
  status: AttendanceStatus;
  note: string;
};

const emptyForm: FormState = {
  employeeName: "",
  date: "",
  status: "present",
  note: "",
};

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function loadAttendance() {
    setLoading(true);
    try {
      const response = await fetch("/api/attendance", { cache: "no-store" });
      const data = (await response.json()) as { attendance?: AttendanceRecord[] };
      setRecords(data.attendance ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAttendance();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const method = editingId ? "PATCH" : "POST";
      const response = await fetch("/api/attendance", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingId ?? undefined }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        setMessage(data.message ?? "Request failed.");
        return;
      }

      resetForm();
      await loadAttendance();
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: string) {
    setMessage("");
    const response = await fetch("/api/attendance", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setMessage(data.message ?? "Delete failed.");
      return;
    }

    if (editingId === id) {
      resetForm();
    }
    await loadAttendance();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Attendance System</h1>
      <p className="mt-2 text-sm text-slate-600">Track daily attendance with simple status updates.</p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <input
          required
          value={form.employeeName}
          onChange={(event) => setForm((prev) => ({ ...prev, employeeName: event.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Employee name"
        />
        <input
          required
          type="date"
          value={form.date}
          onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={form.status}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, status: event.target.value as AttendanceStatus }))
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
        </select>
        <input
          value={form.note}
          onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Note (optional)"
        />

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Saving..." : editingId ? "Update Record" : "Add Record"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {message && <p className="mt-3 text-sm text-red-600">{message}</p>}

      <section className="mt-8 rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold">Attendance Records</div>
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-500">Loading...</p>
        ) : records.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">No attendance records yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {records.map((record) => (
              <li key={record.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{record.employeeName}</p>
                  <p className="text-sm text-slate-600">
                    {record.date} - {record.status}
                    {record.note ? ` - ${record.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(record.id);
                      setForm({
                        employeeName: record.employeeName,
                        date: record.date,
                        status: record.status,
                        note: record.note,
                      });
                    }}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDelete(record.id)}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
