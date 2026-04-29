export type PerformanceRecord = {
  id: string;
  employeeName: string;
  year: number;
  rating: number;
  comments: string;
  createdAt: string;
};

export type YearlyReport = {
  year: number;
  totalReviews: number;
  averageRating: number;
};

const performanceById = new Map<string, PerformanceRecord>();

export function listPerformance() {
  return Array.from(performanceById.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addPerformance(payload: {
  employeeName: string;
  year: number;
  rating: number;
  comments: string;
}) {
  const record: PerformanceRecord = {
    id: crypto.randomUUID(),
    employeeName: payload.employeeName.trim(),
    year: payload.year,
    rating: payload.rating,
    comments: payload.comments.trim(),
    createdAt: new Date().toISOString(),
  };

  performanceById.set(record.id, record);
  return { ok: true as const, record };
}

export function deletePerformance(id: string) {
  const removed = performanceById.delete(id);
  if (!removed) {
    return { ok: false as const, message: "Performance record not found." };
  }
  return { ok: true as const };
}

export function buildYearlyReport(): YearlyReport[] {
  const map = new Map<number, { totalReviews: number; ratingSum: number }>();

  for (const record of performanceById.values()) {
    const existing = map.get(record.year) ?? { totalReviews: 0, ratingSum: 0 };
    existing.totalReviews += 1;
    existing.ratingSum += record.rating;
    map.set(record.year, existing);
  }

  return Array.from(map.entries())
    .map(([year, value]) => ({
      year,
      totalReviews: value.totalReviews,
      averageRating: Number((value.ratingSum / value.totalReviews).toFixed(2)),
    }))
    .sort((a, b) => b.year - a.year);
}
