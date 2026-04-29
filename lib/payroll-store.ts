import { calculatePayroll } from "@/lib/payroll-logic";

export type PayrollRecord = {
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

const payrollById = new Map<string, PayrollRecord>();

export function listPayrollRecords() {
  return Array.from(payrollById.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createPayrollRecord(payload: {
  employeeName: string;
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  deduction: number;
}) {
  const result = calculatePayroll({
    baseSalary: payload.baseSalary,
    overtimeHours: payload.overtimeHours,
    overtimeRate: payload.overtimeRate,
    deduction: payload.deduction,
  });

  const record: PayrollRecord = {
    id: crypto.randomUUID(),
    employeeName: payload.employeeName.trim(),
    baseSalary: result.baseSalary,
    overtimeHours: Math.max(0, payload.overtimeHours),
    overtimeRate: Math.max(0, payload.overtimeRate),
    deduction: result.deduction,
    overtimePay: result.overtimePay,
    grossSalary: result.grossSalary,
    netSalary: result.netSalary,
    createdAt: new Date().toISOString(),
  };

  payrollById.set(record.id, record);
  return { ok: true as const, record };
}

export function deletePayrollRecord(id: string) {
  const removed = payrollById.delete(id);
  if (!removed) {
    return { ok: false as const, message: "Payroll record not found." };
  }
  return { ok: true as const };
}
