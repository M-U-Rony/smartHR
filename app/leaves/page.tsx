"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type LeaveStatus = "pending" | "approved" | "rejected";

type LeaveRecord = {
  id: string;
  employeeName: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
};

type FormState = {
  employeeName: string;
  fromDate: string;
  toDate: string;
  reason: string;
};

const emptyForm: FormState = {
  employeeName: "",
  fromDate: "",
  toDate: "",
  reason: "",
};

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function loadLeaves() {
    setLoading(true);
    try {
      const response = await fetch("/api/leaves", { cache: "no-store" });
      const data = (await response.json()) as { leaves?: LeaveRecord[] };
      setLeaves(data.leaves ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadLeaves();
  }, []);

  const pendingLeaves = useMemo(
    () => leaves.filter((leave) => leave.status === "pending"),
    [leaves],
  );

  async function onApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        setMessage(data.message ?? "Apply request failed.");
        return;
      }

      setForm(emptyForm);
      await loadLeaves();
    } finally {
      setSubmitting(false);
    }
  }

  async function review(id: string, status: "approved" | "rejected") {
    setMessage("");
    const response = await fetch("/api/leaves", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setMessage(data.message ?? "Review request failed.");
      return;
    }

    await loadLeaves();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Leave System</h1>
      <p className="mt-2 text-sm text-slate-600">Employee applies, admin approves or rejects.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Employee Apply Leave</h2>
          <form onSubmit={onApply} className="mt-4 grid gap-3">
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
              value={form.fromDate}
              onChange={(event) => setForm((prev) => ({ ...prev, fromDate: event.target.value }))}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              required
              type="date"
              value={form.toDate}
              onChange={(event) => setForm((prev) => ({ ...prev, toDate: event.target.value }))}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <textarea
              required
              value={form.reason}
              onChange={(event) => setForm((prev) => ({ ...prev, reason: event.target.value }))}
              className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Reason"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Apply Leave"}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-lg font-semibold text-slate-900">Admin Review Pending</h2>
          </div>

          {loading ? (
            <p className="px-4 py-6 text-sm text-slate-500">Loading...</p>
          ) : pendingLeaves.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">No pending leave requests.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {pendingLeaves.map((leave) => (
                <li key={leave.id} className="px-4 py-4">
                  <p className="font-medium text-slate-900">{leave.employeeName}</p>
                  <p className="text-sm text-slate-600">
                    {leave.fromDate} to {leave.toDate}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{leave.reason}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void review(leave.id, "approved")}
                      className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => void review(leave.id, "rejected")}
                      className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}

      <section className="mt-8 rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold">All Leave Requests</div>
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-500">Loading...</p>
        ) : leaves.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">No leave requests yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {leaves.map((leave) => (
              <li key={leave.id} className="px-4 py-3">
                <p className="font-medium text-slate-900">{leave.employeeName}</p>
                <p className="text-sm text-slate-600">
                  {leave.fromDate} to {leave.toDate} - {leave.status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
