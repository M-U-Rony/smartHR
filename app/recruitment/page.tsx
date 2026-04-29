"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type JobRecord = {
  id: string;
  title: string;
  department: string;
  description: string;
  createdAt: string;
};

type CandidateStatus = "applied" | "shortlisted";

type CandidateRecord = {
  id: string;
  jobId: string;
  name: string;
  email: string;
  resume: string;
  status: CandidateStatus;
  createdAt: string;
};

type JobForm = {
  title: string;
  department: string;
  description: string;
};

type ApplyForm = {
  jobId: string;
  name: string;
  email: string;
  resume: string;
};

const emptyJobForm: JobForm = {
  title: "",
  department: "",
  description: "",
};

const emptyApplyForm: ApplyForm = {
  jobId: "",
  name: "",
  email: "",
  resume: "",
};

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [jobForm, setJobForm] = useState<JobForm>(emptyJobForm);
  const [applyForm, setApplyForm] = useState<ApplyForm>(emptyApplyForm);
  const [loading, setLoading] = useState(true);
  const [submittingJob, setSubmittingJob] = useState(false);
  const [submittingCandidate, setSubmittingCandidate] = useState(false);
  const [message, setMessage] = useState("");

  async function loadRecruitment() {
    setLoading(true);
    try {
      const response = await fetch("/api/recruitment", { cache: "no-store" });
      const data = (await response.json()) as { jobs?: JobRecord[]; candidates?: CandidateRecord[] };
      setJobs(data.jobs ?? []);
      setCandidates(data.candidates ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRecruitment();
  }, []);

  const jobTitleById = useMemo(() => {
    return jobs.reduce<Record<string, string>>((acc, job) => {
      acc[job.id] = `${job.title} (${job.department})`;
      return acc;
    }, {});
  }, [jobs]);

  const appliedCandidates = useMemo(
    () => candidates.filter((candidate) => candidate.status === "applied"),
    [candidates],
  );

  async function onPostJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittingJob(true);
    setMessage("");

    try {
      const response = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "post-job", ...jobForm }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        setMessage(data.message ?? "Failed to post job.");
        return;
      }

      setJobForm(emptyJobForm);
      await loadRecruitment();
    } finally {
      setSubmittingJob(false);
    }
  }

  async function onApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittingCandidate(true);
    setMessage("");

    try {
      const response = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply", ...applyForm }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { message?: string };
        setMessage(data.message ?? "Failed to apply.");
        return;
      }

      setApplyForm((prev) => ({ ...emptyApplyForm, jobId: prev.jobId }));
      await loadRecruitment();
    } finally {
      setSubmittingCandidate(false);
    }
  }

  async function onShortlist(candidateId: string) {
    setMessage("");
    const response = await fetch("/api/recruitment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "shortlist", candidateId }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { message?: string };
      setMessage(data.message ?? "Failed to shortlist candidate.");
      return;
    }

    await loadRecruitment();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Recruitment</h1>
      <p className="mt-2 text-sm text-slate-600">
        Admin posts jobs, candidates apply, and admin shortlists candidates.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Admin Job Post</h2>
          <form onSubmit={onPostJob} className="mt-4 grid gap-3">
            <input
              required
              value={jobForm.title}
              onChange={(event) => setJobForm((prev) => ({ ...prev, title: event.target.value }))}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Job title"
            />
            <input
              required
              value={jobForm.department}
              onChange={(event) => setJobForm((prev) => ({ ...prev, department: event.target.value }))}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Department"
            />
            <textarea
              required
              value={jobForm.description}
              onChange={(event) => setJobForm((prev) => ({ ...prev, description: event.target.value }))}
              className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Job description"
            />
            <button
              type="submit"
              disabled={submittingJob}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submittingJob ? "Posting..." : "Post Job"}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-semibold text-slate-900">Candidate Apply</h2>
          <form onSubmit={onApply} className="mt-4 grid gap-3">
            <select
              required
              value={applyForm.jobId}
              onChange={(event) => setApplyForm((prev) => ({ ...prev, jobId: event.target.value }))}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select job</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.department})
                </option>
              ))}
            </select>
            <input
              required
              value={applyForm.name}
              onChange={(event) => setApplyForm((prev) => ({ ...prev, name: event.target.value }))}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Candidate name"
            />
            <input
              required
              type="email"
              value={applyForm.email}
              onChange={(event) => setApplyForm((prev) => ({ ...prev, email: event.target.value }))}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Candidate email"
            />
            <textarea
              required
              value={applyForm.resume}
              onChange={(event) => setApplyForm((prev) => ({ ...prev, resume: event.target.value }))}
              className="min-h-24 rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Resume summary / profile"
            />
            <button
              type="submit"
              disabled={submittingCandidate}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submittingCandidate ? "Submitting..." : "Apply"}
            </button>
          </form>
        </section>
      </div>

      {message && <p className="mt-4 text-sm text-red-600">{message}</p>}

      <section className="mt-8 rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-900">Admin Shortlist</h2>
        </div>
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-500">Loading...</p>
        ) : appliedCandidates.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">No new applications.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {appliedCandidates.map((candidate) => (
              <li key={candidate.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <div>
                  <p className="font-medium text-slate-900">{candidate.name}</p>
                  <p className="text-sm text-slate-600">
                    {candidate.email} - {jobTitleById[candidate.jobId] ?? "Unknown job"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{candidate.resume}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void onShortlist(candidate.id)}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white"
                >
                  Shortlist
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold">All Candidates</div>
        {loading ? (
          <p className="px-4 py-6 text-sm text-slate-500">Loading...</p>
        ) : candidates.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">No candidates yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {candidates.map((candidate) => (
              <li key={candidate.id} className="px-4 py-3">
                <p className="font-medium text-slate-900">{candidate.name}</p>
                <p className="text-sm text-slate-600">
                  {jobTitleById[candidate.jobId] ?? "Unknown job"} - {candidate.status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
