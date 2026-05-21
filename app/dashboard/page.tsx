"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  FileText,
  DollarSign,
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash,
  LogOut,
  Search,
  Filter,
  User,
  Star,
  Award,
  Loader2,
  FileSpreadsheet
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

type JobType = {
  _id: string;
  title: string;
  department: string;
  description: string;
  requirements: string;
  status: "active" | "closed";
};

type CandidateType = {
  _id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  resume: string;
  status: "applied" | "shortlisted" | "rejected" | "hired";
  interviewScore: number;
  notes?: string;
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

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Collections state
  const [employees, setEmployees] = useState<EmployeeType[]>([]);
  const [attendance, setAttendance] = useState<AttendanceType[]>([]);
  const [leaves, setLeaves] = useState<LeaveType[]>([]);
  const [payroll, setPayroll] = useState<PayrollType[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [candidates, setCandidates] = useState<CandidateType[]>([]);
  const [performance, setPerformance] = useState<PerformanceType[]>([]);

  // Search/Filters
  const [empSearch, setEmpSearch] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [payrollMonth, setPayrollMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // Modals / Form States
  const [empModalOpen, setEmpModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeType | null>(null);
  const [empForm, setEmpForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    position: "",
    department: "",
    salary: 0,
  });

  const [payrollModalOpen, setPayrollModalOpen] = useState(false);
  const [selectedPayEmp, setSelectedPayEmp] = useState<EmployeeType | null>(null);
  const [payrollForm, setPayrollForm] = useState({
    overtimeHours: 0,
    overtimeRate: 0,
    deductions: 0,
    status: "pending" as "pending" | "paid",
  });
  const [calculatingPayroll, setCalculatingPayroll] = useState(false);
  const [attSummary, setAttSummary] = useState<{ present: number; late: number; absent: number } | null>(null);
  const [calcError, setCalcError] = useState("");

  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "",
    department: "",
    description: "",
    requirements: "",
  });

  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [selectedCand, setSelectedCand] = useState<CandidateType | null>(null);
  const [candForm, setCandForm] = useState({
    status: "applied" as "applied" | "shortlisted" | "rejected" | "hired",
    interviewScore: 0,
    notes: "",
  });

  const [perfModalOpen, setPerfModalOpen] = useState(false);
  const [selectedPerfEmp, setSelectedPerfEmp] = useState<EmployeeType | null>(null);
  const [perfForm, setPerfForm] = useState({
    year: new Date().getFullYear(),
    rating: 5,
    comments: "",
  });

  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [selectedAttEmp, setSelectedAttEmp] = useState<EmployeeType | null>(null);
  const [attForm, setAttForm] = useState({
    status: "present" as "present" | "late" | "absent",
    clockIn: "09:00:00",
    clockOut: "17:00:00",
    note: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
        if (data.user.role !== "ADMIN") {
          router.push("/employee");
          return;
        }
        setCurrentUser(data.user);
        setAuthLoading(false);
      } catch {
        router.push("/signin");
      }
    }
    checkAuth();
  }, [router]);

  // Load all dashboard data
  useEffect(() => {
    if (!currentUser) return;
    loadAllData();
  }, [currentUser, attendanceDate, payrollMonth]);

  async function loadAllData() {
    setLoading(true);
    try {
      const [empRes, attRes, leaveRes, payRes, jobRes, candRes, perfRes] = await Promise.all([
        fetch("/api/employees"),
        fetch(`/api/attendance?date=${attendanceDate}`),
        fetch("/api/leaves"),
        fetch(`/api/payroll?month=${payrollMonth}`),
        fetch("/api/jobs?all=true"),
        fetch("/api/candidates"),
        fetch("/api/performance"),
      ]);

      if (empRes.ok) setEmployees(await empRes.json());
      if (attRes.ok) setAttendance(await attRes.json());
      if (leaveRes.ok) setLeaves(await leaveRes.json());
      if (payRes.ok) setPayroll(await payRes.json());
      if (jobRes.ok) setJobs(await jobRes.json());
      if (candRes.ok) setCandidates(await candRes.json());
      if (perfRes.ok) setPerformance(await perfRes.json());
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/signin");
  }

  // Employee CRUD Actions
  async function handleEmpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    const method = selectedEmp ? "PUT" : "POST";
    const payload = selectedEmp ? { id: selectedEmp._id, ...empForm } : empForm;

    try {
      const res = await fetch("/api/employees", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save employee.");

      setEmpModalOpen(false);
      setSelectedEmp(null);
      setEmpForm({ name: "", email: "", phone: "", address: "", position: "", department: "", salary: 0 });
      loadAllData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  }

  async function handleEmpDelete(id: string) {
    if (!confirm("Are you sure you want to delete this employee and their credentials?")) return;
    try {
      const res = await fetch(`/api/employees?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete employee.");
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Attendance CRUD Actions
  async function handleAttSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAttEmp) return;
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeEmail: selectedAttEmp.email,
          date: attendanceDate,
          ...attForm,
        }),
      });
      if (!res.ok) throw new Error("Failed to save attendance.");
      setAttendanceModalOpen(false);
      setSelectedAttEmp(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Leave approval Actions
  async function handleLeaveReview(id: string, status: "approved" | "rejected") {
    try {
      const res = await fetch("/api/leaves", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to process leave request.");
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Payroll Actions
  async function handlePayrollSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPayEmp) return;
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeEmail: selectedPayEmp.email,
          month: payrollMonth,
          ...payrollForm,
        }),
      });
      if (!res.ok) throw new Error("Failed to save payroll.");
      setPayrollModalOpen(false);
      setSelectedPayEmp(null);
      setPayrollForm({ overtimeHours: 0, overtimeRate: 0, deductions: 0, status: "pending" });
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleAutoCalculatePayroll() {
    if (!selectedPayEmp) return;
    setCalculatingPayroll(true);
    setCalcError("");
    try {
      const res = await fetch(`/api/payroll/calculate?email=${selectedPayEmp.email}&month=${payrollMonth}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to calculate payroll from attendance.");
      }
      const data = await res.json();
      setPayrollForm({
        overtimeHours: data.overtimeHours,
        overtimeRate: data.overtimeRate,
        deductions: data.deductions,
        status: payrollForm.status,
      });
      setAttSummary(data.attendanceSummary);
    } catch (err: any) {
      setCalcError(err.message || "An error occurred during calculation.");
    } finally {
      setCalculatingPayroll(false);
    }
  }

  async function handlePayrollStatusUpdate(id: string, status: "paid" | "pending") {
    try {
      const res = await fetch("/api/payroll", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update payroll status.");
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Recruitment Job Actions
  async function handleJobSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobForm),
      });
      if (!res.ok) throw new Error("Failed to post job circular.");
      setJobModalOpen(false);
      setJobForm({ title: "", department: "", description: "", requirements: "" });
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleJobStatusUpdate(id: string, status: "active" | "closed") {
    try {
      const res = await fetch("/api/jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update job status.");
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Candidate Actions
  async function handleCandidateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCand) return;
    try {
      const res = await fetch("/api/candidates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedCand._id,
          ...candForm,
        }),
      });
      if (!res.ok) throw new Error("Failed to update candidate details.");
      setCandidateModalOpen(false);
      setSelectedCand(null);
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Performance Actions
  async function handlePerfSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPerfEmp) return;
    try {
      const res = await fetch("/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeEmail: selectedPerfEmp.email,
          reviewedBy: currentUser?.name || "Admin",
          ...perfForm,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit review.");
      setPerfModalOpen(false);
      setSelectedPerfEmp(null);
      setPerfForm({ year: new Date().getFullYear(), rating: 5, comments: "" });
      loadAllData();
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Attendance stats for report
  const todayPresentCount = attendance.filter((a) => a.status === "present" || a.status === "late").length;
  const todayLateCount = attendance.filter((a) => a.status === "late").length;
  const todayAbsentCount = attendance.filter((a) => a.status === "absent").length;

  // Filtered employees
  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(empSearch.toLowerCase()) ||
      emp.email.toLowerCase().includes(empSearch.toLowerCase()) ||
      emp.designation.toLowerCase().includes(empSearch.toLowerCase()) ||
      emp.department.toLowerCase().includes(empSearch.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shrink-0 p-6 border-r border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <span className="p-2 rounded-xl bg-blue-600 text-white font-bold text-xl tracking-tight shadow-md shadow-blue-500/20">SH</span>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white leading-tight">SmartHR</h2>
              <span className="text-xs text-blue-400 font-semibold tracking-wider uppercase">Admin Portal</span>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "employees", label: "Employees", icon: Users },
              { id: "attendance", label: "Attendance", icon: Calendar },
              { id: "leaves", label: "Leaves", icon: FileText },
              { id: "payroll", label: "Payroll", icon: DollarSign },
              { id: "recruitment", label: "Recruitment", icon: Briefcase },
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
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 capitalize">{activeTab} Manager</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and track your smart workforce from one single premium hub.</p>
          </div>
        </header>

        {loading && (
          <div className="fixed top-6 right-6 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-lg flex items-center gap-2 z-50">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-xs font-semibold text-slate-600">Syncing database...</span>
          </div>
        )}

        {/* Tab Contents */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Stats Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Total Employees", value: employees.length, color: "blue", icon: Users },
                { title: "Attendance Today", value: `${todayPresentCount}/${employees.length}`, subtitle: `${todayLateCount} late, ${todayAbsentCount} absent`, color: "emerald", icon: Calendar },
                { title: "Pending Leaves", value: leaves.filter((l) => l.status === "pending").length, color: "amber", icon: FileText },
                { title: "Job Seekers", value: candidates.filter((c) => c.status === "applied" || c.status === "shortlisted").length, color: "purple", icon: Briefcase },
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.title}</p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
                      {"subtitle" in card ? (
                        <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
                      ) : (
                        <p className="text-xs text-slate-500 mt-1">Active registered entries</p>
                      )}
                    </div>
                    <div className={`p-4 rounded-2xl bg-${card.color}-50 text-${card.color}-600`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick overview of latest requests */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Leaves Requests */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Pending Leave Requests</h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {leaves.filter((l) => l.status === "pending").length === 0 ? (
                    <p className="text-sm text-slate-500 py-6 text-center">No pending leave requests found.</p>
                  ) : (
                    leaves
                      .filter((l) => l.status === "pending")
                      .map((req) => (
                        <div key={req._id} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl bg-slate-50">
                          <div>
                            <p className="font-semibold text-sm text-slate-900">{req.employeeName}</p>
                            <p className="text-xs text-slate-500">{req.fromDate} to {req.toDate} ({req.days} days)</p>
                            <p className="text-xs text-slate-600 mt-1 italic">"{req.reason}"</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleLeaveReview(req._id, "approved")}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleLeaveReview(req._id, "rejected")}
                              className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-500 transition"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* Recruitment Candidates */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Candidates Applied</h3>
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {candidates.length === 0 ? (
                    <p className="text-sm text-slate-500 py-6 text-center">No candidate applications found.</p>
                  ) : (
                    candidates.slice(0, 5).map((cand) => (
                      <div key={cand._id} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl bg-slate-50">
                        <div>
                          <p className="font-semibold text-sm text-slate-900">{cand.name}</p>
                          <p className="text-xs text-slate-500">Applied for: <span className="font-semibold text-slate-700">{cand.jobTitle}</span></p>
                          <p className="text-xs text-slate-400 mt-0.5">{cand.email} | {cand.phone}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          cand.status === "applied" ? "bg-blue-50 text-blue-600" :
                          cand.status === "shortlisted" ? "bg-amber-50 text-amber-600" :
                          cand.status === "rejected" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {cand.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "employees" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, department..."
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full text-sm rounded-xl border border-slate-300 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <button
                onClick={() => {
                  setSelectedEmp(null);
                  setEmpForm({ name: "", email: "", phone: "", address: "", position: "", department: "", salary: 0 });
                  setEmpModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition"
              >
                <Plus className="h-4.5 w-4.5" /> Add Employee
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-55 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Designation</th>
                      <th className="px-6 py-4">Department</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4">Salary</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-250">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                          No employees found. Try creating a new employee!
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp) => (
                        <tr key={emp._id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            <div>{emp.name}</div>
                            <div className="text-xs font-normal text-slate-500">{emp.email}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{emp.designation}</td>
                          <td className="px-6 py-4 text-slate-600">{emp.department}</td>
                          <td className="px-6 py-4 text-slate-600">{emp.phone || "-"}</td>
                          <td className="px-6 py-4 font-semibold text-slate-900">${emp.salary.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedEmp(emp);
                                  setEmpForm({
                                    name: emp.name,
                                    email: emp.email,
                                    phone: emp.phone,
                                    address: emp.address,
                                    position: emp.designation,
                                    department: emp.department,
                                    salary: emp.salary,
                                  });
                                  setEmpModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                                title="Edit Profile"
                              >
                                <Edit className="h-4.5 w-4.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPerfEmp(emp);
                                  setPerfForm({ year: new Date().getFullYear(), rating: 5, comments: "" });
                                  setPerfModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-purple-600 transition"
                                title="Review Performance"
                              >
                                <Award className="h-4.5 w-4.5" />
                              </button>
                              <button
                                onClick={() => handleEmpDelete(emp._id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-600 transition"
                                title="Delete"
                              >
                                <Trash className="h-4.5 w-4.5" />
                              </button>
                            </div>
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

        {activeTab === "attendance" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-700">Filter Date:</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl text-sm outline-none transition focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => alert(`Attendance report downloaded successfully for date: ${attendanceDate}`)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <FileSpreadsheet className="h-4.5 w-4.5" /> Export Logs
                </button>
              </div>
            </div>

            {/* Attendance list of employees */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Daily Stats Summary */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Day Summary: {attendanceDate}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border border-emerald-100 bg-emerald-50 rounded-xl">
                    <span className="text-emerald-700 font-semibold text-sm">Present / Late</span>
                    <span className="text-emerald-800 font-bold">{todayPresentCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border border-amber-100 bg-amber-50 rounded-xl">
                    <span className="text-amber-700 font-semibold text-sm">Late Only</span>
                    <span className="text-amber-800 font-bold">{todayLateCount}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 border border-red-100 bg-red-50 rounded-xl">
                    <span className="text-red-700 font-semibold text-sm">Absent</span>
                    <span className="text-red-800 font-bold">{todayAbsentCount}</span>
                  </div>
                </div>
              </div>

              {/* Attendance Registry */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-55 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-250">
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                          Create employee profiles to manage attendance.
                        </td>
                      </tr>
                    ) : (
                      employees.map((emp) => {
                        const log = attendance.find((a) => a.employeeEmail === emp.email);
                        return (
                          <tr key={emp._id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-900">{emp.name}</div>
                              <div className="text-xs text-slate-500">{emp.designation} | {emp.department}</div>
                            </td>
                            <td className="px-6 py-4">
                              {log?.status === "absent" ? (
                                <span className="text-slate-400 font-medium">N/A</span>
                              ) : log ? (
                                <div className="text-xs text-slate-700 font-semibold flex items-center gap-2">
                                  <span>In: {log.clockIn || "--"}</span>
                                  <span>Out: {log.clockOut || "--"}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400">Not recorded</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {log ? (
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                  log.status === "present" ? "bg-emerald-50 text-emerald-600" :
                                  log.status === "late" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"
                                }`}>
                                  {log.status}
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                                  Unmarked
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => {
                                  setSelectedAttEmp(emp);
                                  setAttForm({
                                    status: log?.status || "present",
                                    clockIn: log?.clockIn || "09:00:00",
                                    clockOut: log?.clockOut || "17:00:00",
                                    note: log?.note || "",
                                  });
                                  setAttendanceModalOpen(true);
                                }}
                                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
                              >
                                Mark/Edit
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "leaves" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <h3 className="p-6 font-bold text-lg text-slate-900 border-b border-slate-100">Leave Requests</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-55 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">Leave Duration</th>
                      <th className="px-6 py-4">Reason</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-250">
                    {leaves.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          No leave applications logged.
                        </td>
                      </tr>
                    ) : (
                      leaves.map((req) => (
                        <tr key={req._id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{req.employeeName}</div>
                            <div className="text-xs text-slate-500">{req.employeeEmail}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-800">{req.fromDate} to {req.toDate}</div>
                            <span className="inline-block px-2 py-0.5 mt-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold">{req.days} days</span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">{req.reason}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                              req.status === "approved" ? "bg-emerald-50 text-emerald-600" :
                              req.status === "rejected" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {req.status === "pending" ? (
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => handleLeaveReview(req._id, "approved")}
                                  className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg"
                                  title="Approve"
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleLeaveReview(req._id, "rejected")}
                                  className="p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg"
                                  title="Reject"
                                >
                                  <XCircle className="h-5 w-5" />
                                </button>
                              </div>
                            ) : (
                              <div className="text-center text-xs text-slate-400 font-semibold uppercase">Processed</div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Remaining Leave Balances */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Workforce Leave Balances</h3>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {employees.map((emp) => {
                  const rem = emp.totalLeaves - emp.leavesUsed;
                  return (
                    <div key={emp._id} className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                      <p className="font-semibold text-slate-900 text-sm">{emp.name}</p>
                      <div className="mt-3 flex justify-between items-center text-xs">
                        <span className="text-slate-500">Used: {emp.leavesUsed} / {emp.totalLeaves} days</span>
                        <span className={`px-2 py-0.5 rounded font-semibold ${rem > 5 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                          {rem} days left
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "payroll" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-700">Salary Month:</label>
                <input
                  type="month"
                  value={payrollMonth}
                  onChange={(e) => setPayrollMonth(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl text-sm outline-none transition focus:border-blue-500"
                />
              </div>
            </div>

            {/* Payroll processing ledger */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-55 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Base Salary</th>
                    <th className="px-6 py-4">Overtime Detail</th>
                    <th className="px-6 py-4">Deductions</th>
                    <th className="px-6 py-4">Net Salary</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-250">
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        No employees registered to run payroll.
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => {
                      const pay = payroll.find((p) => p.employeeEmail === emp.email);
                      return (
                        <tr key={emp._id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{emp.name}</div>
                            <div className="text-xs text-slate-500">{emp.email}</div>
                          </td>
                          <td className="px-6 py-4 text-slate-600">${emp.salary.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            {pay ? (
                              <div className="text-xs font-semibold text-slate-700">
                                {pay.overtimeHours} hrs @ ${pay.overtimeRate}/hr
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs font-medium">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-red-600">
                            {pay?.deductions ? `-$${pay.deductions.toLocaleString()}` : "-"}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">
                            {pay ? `$${pay.netSalary.toLocaleString()}` : `$${emp.salary.toLocaleString()}`}
                          </td>
                          <td className="px-6 py-4">
                            {pay ? (
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                pay.status === "paid" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                              }`}>
                                {pay.status}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                                Pending Calc
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => {
                                  setSelectedPayEmp(emp);
                                  setPayrollForm({
                                    overtimeHours: pay?.overtimeHours || 0,
                                    overtimeRate: pay?.overtimeRate || 0,
                                    deductions: pay?.deductions || 0,
                                    status: pay?.status || "pending",
                                  });
                                  setAttSummary(null);
                                  setCalcError("");
                                  setPayrollModalOpen(true);
                                }}
                                className="px-3 py-1 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
                              >
                                Calculate
                              </button>
                              {pay && pay.status === "pending" && (
                                <button
                                  onClick={() => handlePayrollStatusUpdate(pay._id, "paid")}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-bold"
                                  title="Mark Paid"
                                >
                                  Mark Paid
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "recruitment" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-lg text-slate-900">Career Opportunities & Seekers</h3>
              <button
                onClick={() => setJobModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition"
              >
                <Plus className="h-4.5 w-4.5" /> Post Job Opening
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Job Posts */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Active Circulars</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {jobs.length === 0 ? (
                    <p className="text-sm text-slate-500 py-6 text-center">No circulars posted.</p>
                  ) : (
                    jobs.map((job) => (
                      <div key={job._id} className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xxs font-bold uppercase tracking-wide">{job.department}</span>
                            <h4 className="font-bold text-slate-900 text-sm mt-1">{job.title}</h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xxs font-bold uppercase ${job.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                            {job.status}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs mt-2 line-clamp-2">{job.description}</p>
                        <div className="mt-4 flex gap-2">
                          {job.status === "active" ? (
                            <button
                              onClick={() => handleJobStatusUpdate(job._id, "closed")}
                              className="px-2 py-1 border border-slate-350 bg-white hover:bg-slate-50 text-slate-700 rounded text-xxs font-semibold transition"
                            >
                              Close Job
                            </button>
                          ) : (
                            <button
                              onClick={() => handleJobStatusUpdate(job._id, "active")}
                              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xxs font-semibold transition"
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Applicants / Candidates */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <h3 className="p-6 font-bold text-lg text-slate-900 border-b border-slate-100">Applicant Tracking Pipeline</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-55 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                      <tr>
                        <th className="px-6 py-4">Applicant</th>
                        <th className="px-6 py-4">Job Applying</th>
                        <th className="px-6 py-4">Resume Summary</th>
                        <th className="px-6 py-4">Interview Rating</th>
                        <th className="px-6 py-4">Pipeline Status</th>
                        <th className="px-6 py-4 text-center">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-250">
                      {candidates.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                            No applications submitted.
                          </td>
                        </tr>
                      ) : (
                        candidates.map((cand) => (
                          <tr key={cand._id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-900">{cand.name}</div>
                              <div className="text-xs text-slate-500">{cand.email} | {cand.phone}</div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-700 text-xs">{cand.jobTitle}</td>
                            <td className="px-6 py-4 text-slate-500 max-w-[150px] truncate text-xs">{cand.resume}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 font-bold text-slate-900 text-xs">
                                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                {cand.interviewScore}/10
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                cand.status === "applied" ? "bg-blue-50 text-blue-600" :
                                cand.status === "shortlisted" ? "bg-amber-50 text-amber-600" :
                                cand.status === "rejected" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                              }`}>
                                {cand.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => {
                                  setSelectedCand(cand);
                                  setCandForm({
                                    status: cand.status,
                                    interviewScore: cand.interviewScore,
                                    notes: cand.notes || "",
                                  });
                                  setCandidateModalOpen(true);
                                }}
                                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
                              >
                                Edit Status
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
          </div>
        )}

        {activeTab === "performance" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 mb-4">Annual Performance Reviews Log</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-55 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-xs">
                    <tr>
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">Evaluation Year</th>
                      <th className="px-6 py-4">Manager Rating</th>
                      <th className="px-6 py-4">Feedback / Comments</th>
                      <th className="px-6 py-4">Evaluated By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-250">
                    {performance.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                          No performance reviews evaluated. Submit review evaluations under Employee tab.
                        </td>
                      </tr>
                    ) : (
                      performance.map((rev) => (
                        <tr key={rev._id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{rev.employeeName}</div>
                            <div className="text-xs text-slate-500">{rev.employeeEmail}</div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-700">{rev.year}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < rev.rating ? "text-amber-500 fill-amber-500" : "text-slate-200"
                                  }`}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 max-w-[250px] truncate">{rev.comments}</td>
                          <td className="px-6 py-4 text-slate-500 font-medium text-xs">{rev.reviewedBy}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Employee Modal */}
      {empModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setEmpModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 text-2xl font-bold">&times;</button>
            <h3 className="text-2xl font-bold text-slate-900">{selectedEmp ? "Edit Employee Profile" : "Register New Employee"}</h3>
            <p className="text-slate-500 text-xs mt-1">If registering a new employee profile, an online login user account will be generated automatically with password "123456".</p>

            <form onSubmit={handleEmpSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={empForm.name}
                    onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    placeholder="E.g. Mr. John"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Email (Unique)</label>
                  <input
                    type="email"
                    required
                    disabled={!!selectedEmp}
                    value={empForm.email}
                    onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none transition focus:border-blue-500 disabled:bg-slate-100"
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Phone</label>
                  <input
                    type="text"
                    value={empForm.phone}
                    onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    placeholder="E.g. +88017..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Designation</label>
                  <input
                    type="text"
                    required
                    value={empForm.position}
                    onChange={(e) => setEmpForm({ ...empForm, position: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    placeholder="E.g. Software Engineer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Department</label>
                  <input
                    type="text"
                    required
                    value={empForm.department}
                    onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    placeholder="E.g. Engineering"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Base Salary ($)</label>
                  <input
                    type="number"
                    required
                    value={empForm.salary}
                    onChange={(e) => setEmpForm({ ...empForm, salary: Number(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    placeholder="E.g. 5000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Address</label>
                <textarea
                  value={empForm.address}
                  onChange={(e) => setEmpForm({ ...empForm, address: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                  placeholder="Street details..."
                  rows={2}
                />
              </div>

              {errorMsg && <p className="rounded-lg bg-red-50 p-2 text-xs text-red-700 font-semibold">{errorMsg}</p>}

              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEmpModalOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {attendanceModalOpen && selectedAttEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setAttendanceModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 text-2xl font-bold">&times;</button>
            <h3 className="text-xl font-bold text-slate-900">Mark Attendance: {selectedAttEmp.name}</h3>
            <p className="text-xs text-slate-500 mt-1">Date: {attendanceDate}</p>

            <form onSubmit={handleAttSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Status</label>
                <select
                  value={attForm.status}
                  onChange={(e) => setAttForm({ ...attForm, status: e.target.value as any })}
                  className="mt-1 w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                </select>
              </div>

              {attForm.status !== "absent" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Clock In Time</label>
                    <input
                      type="text"
                      value={attForm.clockIn}
                      onChange={(e) => setAttForm({ ...attForm, clockIn: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                      placeholder="HH:MM:SS"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Clock Out Time</label>
                    <input
                      type="text"
                      value={attForm.clockOut}
                      onChange={(e) => setAttForm({ ...attForm, clockOut: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                      placeholder="HH:MM:SS"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Note</label>
                <input
                  type="text"
                  value={attForm.note}
                  onChange={(e) => setAttForm({ ...attForm, note: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-350 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                  placeholder="Reason for late/absence..."
                />
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setAttendanceModalOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                  Save Logs
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payroll Modal */}
      {payrollModalOpen && selectedPayEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setPayrollModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 text-2xl font-bold">&times;</button>
            <h3 className="text-xl font-bold text-slate-900 font-sans">Calculate Payroll: {selectedPayEmp.name}</h3>
            <p className="text-xs text-slate-500 mt-1">Month: {payrollMonth} | Base Salary: ${selectedPayEmp.salary.toLocaleString()}</p>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                disabled={calculatingPayroll}
                onClick={handleAutoCalculatePayroll}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 font-semibold px-4 py-2.5 text-sm transition disabled:opacity-50"
              >
                {calculatingPayroll ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Calculating...
                  </>
                ) : (
                  <>Auto-Fill from Attendance ⚡</>
                )}
              </button>
              
              {calcError && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-lg">{calcError}</p>
              )}

              {attSummary && (
                <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-xl p-3.5 flex flex-col gap-1.5 text-xs text-emerald-800 animate-in fade-in duration-200">
                  <p className="font-bold">Monthly Attendance Summary ({payrollMonth}):</p>
                  <div className="flex gap-4 font-semibold text-emerald-700">
                    <span>Present: <strong className="text-emerald-950 text-sm">{attSummary.present}</strong></span>
                    <span>Late: <strong className="text-emerald-950 text-sm">{attSummary.late}</strong></span>
                    <span>Absent: <strong className="text-emerald-950 text-sm">{attSummary.absent}</strong></span>
                  </div>
                  <p className="text-xxs text-emerald-600 leading-normal mt-0.5 border-t border-emerald-100 pt-1.5">
                    * Deducts Daily Wage (${(selectedPayEmp.salary / 22).toFixed(2)})/absence + $10/late.
                    * Standard shift: 9AM - 5PM. Clock-out after 5PM logs overtime.
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handlePayrollSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Overtime Hours</label>
                  <input
                    type="number"
                    value={payrollForm.overtimeHours}
                    onChange={(e) => setPayrollForm({ ...payrollForm, overtimeHours: Number(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-slate-355 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    placeholder="E.g. 10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Overtime Rate ($/hr)</label>
                  <input
                    type="number"
                    value={payrollForm.overtimeRate}
                    onChange={(e) => setPayrollForm({ ...payrollForm, overtimeRate: Number(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-lg border border-slate-355 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    placeholder="E.g. 25"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Deductions ($)</label>
                <input
                  type="number"
                  value={payrollForm.deductions}
                  onChange={(e) => setPayrollForm({ ...payrollForm, deductions: Number(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-slate-355 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                  placeholder="Tax, unpaid leaves deductions..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Payroll Status</label>
                <select
                  value={payrollForm.status}
                  onChange={(e) => setPayrollForm({ ...payrollForm, status: e.target.value as any })}
                  className="mt-1 w-full rounded-lg border border-slate-355 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setPayrollModalOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                  Run & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Job Modal */}
      {jobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setJobModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 text-2xl font-bold">&times;</button>
            <h3 className="text-xl font-bold text-slate-900 font-sans">Post Job circular</h3>

            <form onSubmit={handleJobSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Job Title</label>
                  <input
                    type="text"
                    required
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-355 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    placeholder="E.g. Lead Developer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Department</label>
                  <input
                    type="text"
                    required
                    value={jobForm.department}
                    onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-355 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                    placeholder="E.g. Sales, Tech"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Job Description</label>
                <textarea
                  required
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-355 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                  placeholder="Summarize role duties..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Requirements</label>
                <textarea
                  required
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-355 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                  placeholder="Required skills, experiences..."
                  rows={3}
                />
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setJobModalOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Modal */}
      {candidateModalOpen && selectedCand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setCandidateModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 text-2xl font-bold">&times;</button>
            <h3 className="text-xl font-bold text-slate-900">Manage Pipeline: {selectedCand.name}</h3>
            <p className="text-xs text-slate-500 mt-1">Applying for: {selectedCand.jobTitle}</p>

            <form onSubmit={handleCandidateSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Interview Result Score (0 - 10)</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={candForm.interviewScore}
                  onChange={(e) => setCandForm({ ...candForm, interviewScore: Number(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-lg border border-slate-355 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Application Status</label>
                <select
                  value={candForm.status}
                  onChange={(e) => setCandForm({ ...candForm, status: e.target.value as any })}
                  className="mt-1 w-full rounded-lg border border-slate-355 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                >
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired (Approved)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Internal Notes</label>
                <textarea
                  value={candForm.notes}
                  onChange={(e) => setCandForm({ ...candForm, notes: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-355 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                  placeholder="Add details about interview answers..."
                  rows={3}
                />
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setCandidateModalOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                  Update Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Performance Review Modal */}
      {perfModalOpen && selectedPerfEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setPerfModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-655 text-2xl font-bold">&times;</button>
            <h3 className="text-xl font-bold text-slate-900">Evaluate Performance: {selectedPerfEmp.name}</h3>
            <p className="text-xs text-slate-500 mt-1">Submit annual review evaluation feedback</p>

            <form onSubmit={handlePerfSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Review Year</label>
                  <input
                    type="number"
                    value={perfForm.year}
                    onChange={(e) => setPerfForm({ ...perfForm, year: Number(e.target.value) || 2026 })}
                    className="mt-1 w-full rounded-lg border border-slate-355 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase">Rating Score (1 - 5 Stars)</label>
                  <select
                    value={perfForm.rating}
                    onChange={(e) => setPerfForm({ ...perfForm, rating: Number(e.target.value) || 5 })}
                    className="mt-1 w-full rounded-lg border border-slate-355 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                  >
                    <option value={5}>5 Stars (Excellent)</option>
                    <option value={4}>4 Stars (Very Good)</option>
                    <option value={3}>3 Stars (Average)</option>
                    <option value={2}>2 Stars (Below Avg)</option>
                    <option value={1}>1 Star (Poor)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase">Evaluation Comments</label>
                <textarea
                  required
                  value={perfForm.comments}
                  onChange={(e) => setPerfForm({ ...perfForm, comments: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-355 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
                  placeholder="Detail strengths, improvements..."
                  rows={4}
                />
              </div>

              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setPerfModalOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
