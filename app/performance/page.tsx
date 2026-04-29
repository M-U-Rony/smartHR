"use client";

import { FormEvent, useEffect, useState } from "react";

type PerformanceRecord = {
  id: string;
  employeeName: string;
  year: number;
  rating: number;
  comments: string;
  createdAt: string;
};

type YearlyReport = {
  year: number;
  totalReviews: number;
  averageRating: number;
};

type FormState = {
  employeeName: string;
  year: string;
  rating: string;
  comments: string;
};

const currentYear = new Date().getFullYear();

const emptyForm: FormState = {
  employeeName: "",
  year: String(currentYear),
  rating: "3",
  comments: "",
};

export default function PerformancePage() {
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
  const [yearlyReport, setYearlyReport] = useState<YearlyReport[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function loadPerformance() {
    setLoading(true);
    try {
      const response = await fetch("/api/performance", { cache: "no-store" });
      const data = (await response.json()) as {
        records?: PerformanceRecord[];
        yearlyReport?: YearlyReport[];
      };
      setRecords(data.records ?? []);
      setYearlyReport(data.yearlyReport ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPerformance();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeName: form.employeeName,
          year: Number(form.year),
          rating: Number(form.rating),
          comments: form.comments,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        setMessage(data.message ?? "Create review failed.");
        return;
      }

      setForm(emptyForm);
      await loadPerformance();
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: string) {
    setMessage("");
    const response = await fetch("/api/performance", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setMessage(data.message ?? "Delete failed.");
      return;
    }

    await loadPerformance();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Performance</h1>
      <p className="mt-2 text-sm text-slate-600">Track rating (1-5), comments, and yearly report summary.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Add Performance Review</h2>
          <form onSubmit={onSubmit} className="mt-4 grid gap-3">
            <input
              required
              value={form.employeeName}
              onChange={(event) => setForm((prev) => ({ ...prev, employeeName: event.target.value }))}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Employee name"
            />
            <input
              required
              type="number"
              min="2000"
              max="2100"
              value={form.year}
              onChange={(event) => setForm((prev) => ({ ...prev, year: event.target.value }))}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Year"
            />
            <input
              required
              type="number"
              min="1"
              max="5"
              value={form.rating}
              onChange={(event) => setForm((prev) => ({ ...prev, rating: event.target.value }))}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Rating (1-5)"
            />
            <textarea
              required
              value={form.comments}
              onChange={(event) => setForm((prev) => ({ ...prev, comments: event.target.value }))}
              className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Comments"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Add Review"}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="text-lg font-semibold text-slate-900">Yearly Report</h2>
          </div>
          {loading ? (
            <p className="px-4 py-6 text-sm text-slate-500">Loading...</p>
          ) : yearlyReport.length === 0 ? (
            <p className="px-4 py-6 text-sm text-slate-500">No yearly report yet.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {yearlyReport.map((item) => (
                <li key={item.year} className="px-4 py-3">
                  <p className="font-medium text-slate-900">{item.year}</p>
                  <p className="text-sm text-slate-600">
                    Total Reviews: {item.totalReviews} | Average Rating: {item.averageRating}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}

      <section className="mt-8 rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold">Performance Records</div>
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-500">Loading...</p>
        ) : records.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">No records yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {records.map((record) => (
              <li key={record.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{record.employeeName}</p>
                  <p className="text-sm text-slate-600">
                    {record.year} - Rating {record.rating}/5
                  </p>
                  <p className="text-sm text-slate-600">{record.comments}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void onDelete(record.id)}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
