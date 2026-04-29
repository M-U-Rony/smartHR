export type PayrollInput = {
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  deduction: number;
};

export type PayrollResult = {
  baseSalary: number;
  overtimePay: number;
  deduction: number;
  grossSalary: number;
  netSalary: number;
};

function safeNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

export function calculatePayroll(input: PayrollInput): PayrollResult {
  const baseSalary = Math.max(0, safeNumber(input.baseSalary));
  const overtimeHours = Math.max(0, safeNumber(input.overtimeHours));
  const overtimeRate = Math.max(0, safeNumber(input.overtimeRate));
  const deduction = Math.max(0, safeNumber(input.deduction));

  const overtimePay = overtimeHours * overtimeRate;
  const grossSalary = baseSalary + overtimePay;
  const netSalary = Math.max(0, grossSalary - deduction);

  return {
    baseSalary,
    overtimePay,
    deduction,
    grossSalary,
    netSalary,
  };
}
