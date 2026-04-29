export type CandidateStatus = "applied" | "shortlisted";

export type JobRecord = {
  id: string;
  title: string;
  department: string;
  description: string;
  createdAt: string;
};

export type CandidateRecord = {
  id: string;
  jobId: string;
  name: string;
  email: string;
  resume: string;
  status: CandidateStatus;
  createdAt: string;
};

const jobsById = new Map<string, JobRecord>();
const candidatesById = new Map<string, CandidateRecord>();

export function listJobs() {
  return Array.from(jobsById.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listCandidates() {
  return Array.from(candidatesById.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createJob(payload: { title: string; department: string; description: string }) {
  const job: JobRecord = {
    id: crypto.randomUUID(),
    title: payload.title.trim(),
    department: payload.department.trim(),
    description: payload.description.trim(),
    createdAt: new Date().toISOString(),
  };

  jobsById.set(job.id, job);
  return { ok: true as const, job };
}

export function applyCandidate(payload: { jobId: string; name: string; email: string; resume: string }) {
  const job = jobsById.get(payload.jobId);
  if (!job) {
    return { ok: false as const, status: 404, message: "Job not found." };
  }

  const candidate: CandidateRecord = {
    id: crypto.randomUUID(),
    jobId: payload.jobId,
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    resume: payload.resume.trim(),
    status: "applied",
    createdAt: new Date().toISOString(),
  };

  candidatesById.set(candidate.id, candidate);
  return { ok: true as const, candidate };
}

export function shortlistCandidate(id: string) {
  const candidate = candidatesById.get(id);
  if (!candidate) {
    return { ok: false as const, status: 404, message: "Candidate not found." };
  }

  const updated: CandidateRecord = { ...candidate, status: "shortlisted" };
  candidatesById.set(id, updated);
  return { ok: true as const, candidate: updated };
}
