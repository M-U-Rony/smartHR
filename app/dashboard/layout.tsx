import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/employees", label: "Employees" },
  { href: "/dashboard/attendance", label: "Attendance" },
  { href: "/dashboard/leaves", label: "Leaves" },
  { href: "/dashboard/payroll", label: "Payroll" },
  { href: "/dashboard/recruitment", label: "Recruitment" },
  { href: "/dashboard/performance", label: "Performance" },
];

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const session = cookieStore.get("smarthr_session")?.value;

  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl md:grid-cols-[240px_1fr]">
        <aside className="border-r border-slate-200 bg-slate-900 p-5 text-slate-100">
          <p className="text-xl font-bold">SmartHR Admin</p>
          <p className="mt-1 text-xs text-slate-400">Protected Dashboard</p>
          <nav className="mt-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-800"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
