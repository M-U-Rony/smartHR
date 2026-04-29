"use client";

import { FormEvent, useEffect, useState } from "react";

type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  createdAt: string;
};

type FormState = {
  name: string;
  email: string;
  department: string;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  department: "",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function loadEmployees() {
    setLoading(true);
    try {
      const response = await fetch("/api/employees", { cache: "no-store" });
      const data = (await response.json()) as { employees?: Employee[] };
      setEmployees(data.employees ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadEmployees();
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
      const response = await fetch("/api/employees", {
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
      await loadEmployees();
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(id: string) {
    setMessage("");
    const response = await fetch("/api/employees", {
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
    await loadEmployees();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Employee Management</h1>
      <p className="mt-2 text-sm text-slate-600">Add, update, and delete employees from one page.</p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <input
          required
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Employee name"
        />
        <input
          required
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Employee email"
        />
        <input
          required
          value={form.department}
          onChange={(event) => setForm((prev) => ({ ...prev, department: event.target.value }))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Department"
        />

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Saving..." : editingId ? "Update Employee" : "Add Employee"}
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
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold">Employees</div>
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-500">Loading...</p>
        ) : employees.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">No employees yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {employees.map((employee) => (
              <li key={employee.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{employee.name}</p>
                  <p className="text-sm text-slate-600">
                    {employee.email} - {employee.department}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(employee.id);
                      setForm({
                        name: employee.name,
                        email: employee.email,
                        department: employee.department,
                      });
                    }}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void onDelete(employee.id)}
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
