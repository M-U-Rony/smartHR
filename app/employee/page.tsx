"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  User,
  Star,
  Award,
  LogOut,
  MapPin,
  Briefcase,
  AlertCircle,
  Loader2,
  CheckCircle,
  Download,
  Building
} from "lucide-react";

type UserType = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
};

type EmployeeType = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  designation: string;
  department: string;
  salary: number;
  totalLeaves: number;
  leavesUsed: number;
  joinedDate: string;
};

type AttendanceType = {
  _id: string;
  employeeEmail: string;
  date: string;
  status: "present" | "late" | "absent";
  clockIn?: string;
  clockOut?: string;
  note?: string;
};

type LeaveType = {
  _id: string;
  employeeEmail: string;
  employeeName: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  days: number;
};

type PayrollType = {
  _id: string;
  employeeEmail: string;
  employeeName: string;
  month: string;
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  deductions: number;
  netSalary: number;
  status: "paid" | "pending";
};

type PerformanceType = {
  _id: string;
  employeeEmail: string;
  employeeName: string;
  year: number;
  rating: number;
  comments: string;
  reviewedBy: string;
};

export default function EmployeePortal() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Profile and features state
  const [profile, setProfile] = useState<EmployeeType | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [attendance, setAttendance] = useState<AttendanceType[]>([]);
  const [leaves, setLeaves] = useState<LeaveType[]>([]);
  const [payroll, setPayroll] = useState<PayrollType[]>([]);
  const [performance, setPerformance] = useState<PerformanceType[]>([]);

  // Attendance Form
  const [todayLog, setTodayLog] = useState<AttendanceType | null>(null);
  const [clocking, setClocking] = useState(false);

  // Leave Form
  const [leaveForm, setLeaveForm] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [leaveError, setLeaveError] = useState("");
  const [leaveSuccess, setLeaveSuccess] = useState("");
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Authenticate user
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/signin");
          return;
        }
        const data = await res.json();
        setCurrentUser(data.user);
        setAuthLoading(false);
      } catch {
        router.push("/signin");
      }
    }
    checkAuth();
  }, [router]);

  // Load employee profile and related data
  useEffect(() => {
    if (!currentUser) return;
    loadEmployeeData();
  }, [currentUser]);

  async function loadEmployeeData() {
    if (!currentUser) return;
    setProfileLoading(true);
    const email = currentUser.email;

    try {
      // 1. Fetch profile
      const empRes = await fetch(`/api/employees`);
      if (empRes.ok) {
        const allEmps: EmployeeType[] = await empRes.json();
        const myProfile = allEmps.find((e) => e.email.toLowerCase() === email.toLowerCase());
        
        if (myProfile) {
          setProfile(myProfile);
        } else {
          // No profile exists — HR/Admin hasn't added this employee yet
          setProfile(null);
        }
      }

      // 2. Fetch history collections
      const [attRes, leaveRes, payRes, perfRes] = await Promise.all([
        fetch(`/api/attendance?email=${email}`),
        fetch(`/api/leaves?email=${email}`),
        fetch(`/api/payroll?email=${email}`),
        fetch(`/api/performance?email=${email}`),
      ]);

      if (attRes.ok) {
        const attLogs: AttendanceType[] = await attRes.json();
        setAttendance(attLogs);
        // Find today's log if it exists
        const todayStr = new Date().toISOString().split("T")[0];
        const today = attLogs.find((a) => a.date === todayStr);
        setTodayLog(today || null);
      }
      if (leaveRes.ok) setLeaves(await leaveRes.json());
      if (payRes.ok) setPayroll(await payRes.json());
      if (perfRes.ok) setPerformance(await perfRes.json());

    } catch (err) {
      console.error("Error loading employee data:", err);
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/signin");
  }

  // Attendance Clock actions
  async function handleClockIn() {
    if (!currentUser || clocking) return;
    setClocking(true);
    const todayStr = new Date().toISOString().split("T")[0];
    const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });

    // Mark as present/late depending on shift start (say, late after 09:15:00)
    const minutesAfterNine = new Date().getHours() * 60 + new Date().getMinutes() - 9 * 60;
    const status = minutesAfterNine > 15 ? "late" : "present";

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeEmail: currentUser.email,
          date: todayStr,
          status,
          clockIn: timeStr,
        }),
      });
      if (!res.ok) throw new Error("Failed to clock in.");
      loadEmployeeData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setClocking(false);
    }
  }

  async function handleClockOut() {
    if (!currentUser || clocking || !todayLog) return;
    setClocking(true);
    const todayStr = new Date().toISOString().split("T")[0];
    const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeEmail: currentUser.email,
          date: todayStr,
          clockOut: timeStr,
          isClockOutOnly: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to clock out.");
      loadEmployeeData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setClocking(false);
    }
  }

  // Leave Form Submit
  async function handleLeaveSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) return;
    setLeaveError("");
    setLeaveSuccess("");
    setSubmittingLeave(true);

    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeEmail: currentUser.email,
          employeeName: currentUser.name,
          ...leaveForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit leave request.");

      setLeaveSuccess("Leave application submitted successfully! Awaiting manager review.");
      setLeaveForm({ fromDate: "", toDate: "", reason: "" });
      loadEmployeeData();
    } catch (err: any) {
      setLeaveError(err.message);
    } finally {
      setSubmittingLeave(false);
    }
  }

  if (authLoading || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const remainingLeaves = profile ? profile.totalLeaves - profile.leavesUsed : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row animate-in fade-in duration-200">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shrink-0 p-6 border-r border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <span className="p-2 rounded-xl bg-blue-600 text-white font-bold text-xl tracking-tight shadow-md shadow-blue-500/20">SH</span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white leading-tight">SmartHR</h2>
              <span className="text-xs text-blue-400 font-semibold tracking-wider uppercase">Employee Portal</span>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: "overview", label: "My Overview", icon: TrendingUp },
              { id: "attendance", label: "My Attendance", icon: Clock },
              { id: "leaves", label: "Leave Desk", icon: FileText },
              { id: "payroll", label: "My Payslips", icon: DollarSign },
              { id: "performance", label: "Performance", icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
              {currentUser?.name[0]}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-white truncate max-w-[110px]">{currentUser?.name}</p>
              <p className="text-xs text-slate-500 truncate max-w-[110px]">{currentUser?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition">
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 capitalize">
            {activeTab === "overview" ? "Welcome back!" : `${activeTab} desk`}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Hello, {currentUser?.name}. Track your shifts, leaves, and evaluations seamlessly.</p>
        </header>

        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Clock-in card */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Daily Shift Clock */}
              <div className="md:col-span-2 rounded-3xl bg-gradient-to-br from-slate-900 to-blue-900 p-8 text-white shadow-xl flex flex-col justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded bg-white/20 text-blue-100 text-xs font-semibold uppercase tracking-wide">Daily Shift</span>
                  <h3 className="text-3xl font-bold mt-4">Workday Clock-In</h3>
                  <p className="text-sm text-blue-200 mt-1">Standard shift is 9:00 AM - 5:00 PM. Clock in daily to secure attendance.</p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-6">
                  {todayLog ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-blue-300">Today's Clock Status:</span>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                          <p className="text-xxs uppercase tracking-wider text-blue-200">Clock In</p>
                          <p className="text-lg font-bold">{todayLog.clockIn}</p>
                        </div>
                        <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/10">
                          <p className="text-xxs uppercase tracking-wider text-blue-200">Clock Out</p>
                          <p className="text-lg font-bold">{todayLog.clockOut || "--:--:--"}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-blue-300 font-semibold">You have not clocked in for today yet.</p>
                  )}

                  <div className="flex gap-3">
                    <button
                      disabled={!!todayLog || clocking}
                      onClick={handleClockIn}
                      className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl text-sm transition hover:bg-blue-50 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {clocking ? "Processing..." : "Clock In"}
                    </button>
                    <button
                      disabled={!todayLog || !!todayLog.clockOut || clocking}
                      onClick={handleClockOut}
                      className="px-6 py-3 bg-red-600 hover:bg-red-500 font-bold rounded-xl text-sm transition hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Clock Out
                    </button>
                  </div>
                </div>
              </div>

              {/* Leave summary circle */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Leave Balance</h4>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold text-slate-900">{remainingLeaves}</span>
                    <span className="text-slate-500 text-sm font-semibold">/ {profile?.totalLeaves || 20} days left</span>
                  </div>
                </div>
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>Approved leaves used:</span>
                    <span className="font-bold text-slate-700">{profile?.leavesUsed || 0} days</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 mt-2">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${((profile?.leavesUsed || 0) / (profile?.totalLeaves || 20)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Profile detail grid */}
            {profile && (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><User className="h-5 w-5 text-blue-600" /> Employee Profile Card</h3>
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                  <div>
                    <span className="text-xxs font-bold uppercase text-slate-400">Full Name</span>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5">{profile.name}</p>
                  </div>
                  <div>
                    <span className="text-xxs font-bold uppercase text-slate-400">Designation</span>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5">{profile.designation}</p>
                  </div>
                  <div>
                    <span className="text-xxs font-bold uppercase text-slate-400">Department</span>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5">{profile.department}</p>
                  </div>
                  <div>
                    <span className="text-xxs font-bold uppercase text-slate-400">Email Address</span>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5">{profile.email}</p>
                  </div>
                  <div>
                    <span className="text-xxs font-bold uppercase text-slate-400">Phone Number</span>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5">{profile.phone || "-"}</p>
                  </div>
                  <div>
                    <span className="text-xxs font-bold uppercase text-slate-400">Current Base Salary</span>
                    <p className="font-semibold text-slate-800 text-sm mt-0.5">${profile.salary.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <h3 className="p-6 font-bold text-lg text-slate-900 border-b border-slate-100">Attendance Log History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-55 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Shift Date</th>
                      <th className="px-6 py-4">Clock In</th>
                      <th className="px-6 py-4">Clock Out</th>
                      <th className="px-6 py-4">Notes</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-250">
                    {attendance.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          No attendance records found. Clock in daily to build logs.
                        </td>
                      </tr>
                    ) : (
                      attendance.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 font-semibold text-slate-900">{log.date}</td>
                          <td className="px-6 py-4 text-slate-700 font-medium">{log.clockIn || "--:--:--"}</td>
                          <td className="px-6 py-4 text-slate-700 font-medium">{log.clockOut || "--:--:--"}</td>
                          <td className="px-6 py-4 text-slate-550 max-w-[200px] truncate">{log.note || "-"}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                              log.status === "present" ? "bg-emerald-50 text-emerald-600" :
                              log.status === "late" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "leaves" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Leave Application Form */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Request Leave</h3>
                <form onSubmit={handleLeaveSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase">From Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.fromDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase">To Date</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.toDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Reason</label>
                    <textarea
                      required
                      rows={3}
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none focus:border-blue-500"
                      placeholder="Medical, personal, vacation reasons..."
                    />
                  </div>

                  {leaveError && <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700 font-semibold">{leaveError}</p>}
                  {leaveSuccess && <p className="rounded-lg bg-emerald-50 p-2 text-xs text-emerald-700 font-semibold">{leaveSuccess}</p>}

                  <button
                    type="submit"
                    disabled={submittingLeave}
                    className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition disabled:opacity-75"
                  >
                    {submittingLeave ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : "Submit Application"}
                  </button>
                </form>
              </div>

              {/* Leave Applications History */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <h3 className="p-6 font-bold text-lg text-slate-900 border-b border-slate-100">Leave Applications History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-55 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                      <tr>
                        <th className="px-6 py-4">Dates</th>
                        <th className="px-6 py-4">Total Days</th>
                        <th className="px-6 py-4">Reason</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-250">
                      {leaves.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                            No leave applications requested yet.
                          </td>
                        </tr>
                      ) : (
                        leaves.map((req) => (
                          <tr key={req._id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4 font-semibold text-slate-900">
                              {req.fromDate} to {req.toDate}
                            </td>
                            <td className="px-6 py-4 text-slate-700">{req.days} days</td>
                            <td className="px-6 py-4 text-slate-500 max-w-[180px] truncate">{req.reason}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                req.status === "approved" ? "bg-emerald-50 text-emerald-600" :
                                req.status === "rejected" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                              }`}>
                                {req.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payroll" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <h3 className="p-6 font-bold text-lg text-slate-900 border-b border-slate-100">My Paycheck History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-55 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Month</th>
                      <th className="px-6 py-4">Base Salary</th>
                      <th className="px-6 py-4">Overtime Detail</th>
                      <th className="px-6 py-4">Deductions</th>
                      <th className="px-6 py-4 font-bold">Net Salary Paid</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Payslip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-250">
                    {payroll.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                          No payroll paychecks calculated yet for your account.
                        </td>
                      </tr>
                    ) : (
                      payroll.map((pay) => (
                        <tr key={pay._id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 font-semibold text-slate-900">{pay.month}</td>
                          <td className="px-6 py-4 text-slate-600">${pay.baseSalary.toLocaleString()}</td>
                          <td className="px-6 py-4 text-slate-700">
                            {pay.overtimeHours > 0 ? (
                              <span className="text-xs">{pay.overtimeHours} hrs @ ${pay.overtimeRate}/hr</span>
                            ) : (
                              <span className="text-slate-400 text-xs">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-red-600">
                            {pay.deductions > 0 ? `-$${pay.deductions.toLocaleString()}` : "-"}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">${pay.netSalary.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                              pay.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                            }`}>
                              {pay.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => alert(`Payslip slip generated for month: ${pay.month}. File downloading...`)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg inline-flex items-center gap-1"
                              title="Download PDF"
                            >
                              <Download className="h-4.5 w-4.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "performance" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600 animate-pulse" /> My Annual Performance Review Feedbacks
              </h3>
              <div className="space-y-6">
                {performance.length === 0 ? (
                  <p className="text-sm text-slate-500 py-12 text-center">No review reports submitted yet by your manager.</p>
                ) : (
                  performance.map((rev) => (
                    <div key={rev._id} className="p-6 border border-slate-200 rounded-2xl bg-slate-50 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-0.5 rounded bg-blue-600 text-white font-bold text-xs">Year {rev.year}</span>
                          <span className="text-xs text-slate-400 font-semibold">Reviewed by {rev.reviewedBy}</span>
                        </div>
                        <p className="text-slate-700 font-medium text-sm leading-relaxed">"{rev.comments}"</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < rev.rating ? "text-amber-500 fill-amber-500" : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
