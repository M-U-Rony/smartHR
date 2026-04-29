import Link from "next/link";

const modules = [
  { href: "/dashboard/employees", title: "Employees", desc: "Manage employee profiles and records." },
  { href: "/dashboard/attendance", title: "Attendance", desc: "Track attendance status and daily records." },
  { href: "/dashboard/leaves", title: "Leaves", desc: "Apply, approve, and reject leave requests." },
  { href: "/dashboard/payroll", title: "Payroll", desc: "Calculate payroll with overtime and deduction." },
  { href: "/dashboard/recruitment", title: "Recruitment", desc: "Post jobs, apply, and shortlist candidates." },
  { href: "/dashboard/performance", title: "Performance", desc: "Review ratings, comments, yearly report." },
];

export default function DashboardOverviewPage() {
  return (
    <main>
      <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
      <p className="mt-2 text-sm text-slate-600">Welcome to your SmartHR admin panel.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
          >
            <p className="font-semibold text-slate-900">{module.title}</p>
            <p className="mt-1 text-sm text-slate-600">{module.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
