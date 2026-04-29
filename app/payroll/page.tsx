"use client";

import { FormEvent, useEffect, useState } from "react";

type PayrollRecord = {
  id: string;
  employeeName: string;
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  deduction: number;
  overtimePay: number;
  grossSalary: number;
  netSalary: number;
  createdAt: string;
};

type FormState = {
  employeeName: string;
  baseSalary: string;
  overtimeHours: string;
  overtimeRate: string;
  deduction: string;
};

const emptyForm: FormState = {
  employeeName: "",
  baseSalary: "",
  overtimeHours: "",
  overtimeRate: "",
  deduction: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

export default function PayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function loadPayroll() {
    setLoading(true);
    try {
      const response = await fetch("/api/payroll", { cache: "no-store" });
      const data = (await response.json()) as { payroll?: PayrollRecord[] };
      setRecords(data.payroll ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPayroll();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeName: form.employeeName,
          baseSalary: Number(form.baseSalary || 0),
          overtimeHours: Number(form.overtimeHours || 0),
          overtimeRate: Number(form.overtimeRate || 0),
          deduction: Number(form.deduction || 0),
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        setMessage(data.message ?? "Payroll create failed.");
        return;
      }

      setForm(emptyForm);
      await loadPayroll();
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: string) {
    setMessage("");
    const response = await fetch("/api/payroll", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setMessage(data.message ?? "Delete failed.");
      return;
    }

    await loadPayroll();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Payroll System</h1>
      <p className="mt-2 text-sm text-slate-600">
        Net salary = Base salary + (Overtime hours x Overtime rate) - Deduction.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <input
          required
          value={form.employeeName}
          onChange={(event) => setForm((prev) => ({ ...prev, employeeName: event.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Employee name"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.baseSalary}
          onChange={(event) => setForm((prev) => ({ ...prev, baseSalary: event.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Base salary"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.overtimeHours}
          onChange={(event) => setForm((prev) => ({ ...prev, overtimeHours: event.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Overtime hours"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.overtimeRate}
          onChange={(event) => setForm((prev) => ({ ...prev, overtimeRate: event.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Overtime rate"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.deduction}
          onChange={(event) => setForm((prev) => ({ ...prev, deduction: event.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Deduction"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-fit rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Calculating..." : "Create Payroll"}
        </button>
      </form>

      {message && <p className="mt-3 text-sm text-red-600">{message}</p>}

      <section className="mt-8 rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold">Payroll Records</div>
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-500">Loading...</p>
        ) : records.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">No payroll records yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {records.map((record) => (
              <li key={record.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <div>
                  <p className="font-medium text-slate-900">{record.employeeName}</p>
                  <p className="text-sm text-slate-600">
                    Base: {formatCurrency(record.baseSalary)} | Overtime: {formatCurrency(record.overtimePay)} |
                    Deduction: {formatCurrency(record.deduction)}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    Gross: {formatCurrency(record.grossSalary)} | Net: {formatCurrency(record.netSalary)}
                  </p>
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
