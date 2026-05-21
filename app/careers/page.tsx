"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, MapPin, Building, Calendar, ArrowLeft, Loader2, Send } from "lucide-react";

type Job = {
  _id: string;
  title: string;
  department: string;
  description: string;
  requirements: string;
  createdAt: string;
};

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Application Modal state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resume, setResume] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/jobs");
        if (!res.ok) throw new Error("Failed to load jobs.");
        const data = await res.json();
        setJobs(data);
      } catch (err: any) {
        setError(err.message || "An error occurred while loading careers.");
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedJob) return;
    setSubmitting(true);
    setSubmitSuccess("");
    setSubmitError("");

    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJob._id,
          name,
          email,
          phone,
          resume,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit application.");

      setSubmitSuccess("Your application has been submitted successfully! Our team will review it and get back to you.");
      setName("");
      setEmail("");
      setPhone("");
      setResume("");
      setTimeout(() => {
        setSelectedJob(null);
        setSubmitSuccess("");
      }, 3000);
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-blue-600 transition">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
            <span className="h-5 w-px bg-slate-200" />
            <Link href="/" className="text-xl font-bold text-slate-900 tracking-tight">SmartHR</Link>
          </div>
          <div>
            <Link href="/signin" className="rounded-md bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-blue-50/40 border-b border-slate-200 py-16 text-center">
        <div className="mx-auto max-w-3xl px-6">
          <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            Join Our Team
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Build the Future of Workforce Automation
          </h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            We are looking for passionate, innovative individuals who want to redefine how companies manage and nurture their employees.
          </p>
        </div>
      </section>

      {/* Job Board */}
      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Current Job Openings</h2>
          <p className="mt-1 text-sm text-slate-500">Explore our active career positions below.</p>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
            <Briefcase className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No Openings Right Now</h3>
            <p className="mt-2 text-sm text-slate-500">We don't have any active openings at the moment. Please check back later!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div key={job._id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                      {job.department}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-slate-900 hover:text-blue-600 transition">{job.title}</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Remote / Onsite</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-semibold uppercase text-slate-400">Description</h4>
                    <p className="mt-1 line-clamp-3 text-sm text-slate-600">{job.description}</p>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold uppercase text-slate-400">Requirements</h4>
                    <p className="mt-1 line-clamp-3 text-sm text-slate-600">{job.requirements}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedJob(job)}
                  className="mt-8 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Apply Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl font-bold"
            >
              &times;
            </button>
            <span className="inline-block rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
              Applying for {selectedJob.department}
            </span>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">{selectedJob.title}</h3>

            <form onSubmit={handleApply} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="cand-name">Full Name</label>
                <input
                  id="cand-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Your Full Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700" htmlFor="cand-email">Email</label>
                  <input
                    id="cand-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700" htmlFor="cand-phone">Phone</label>
                  <input
                    id="cand-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Your Phone Number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="cand-resume">Resume Details / Cover Letter</label>
                <textarea
                  id="cand-resume"
                  required
                  rows={4}
                  value={resume}
                  onChange={(e) => setResume(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Paste your resume details, experiences, cover letter, or links to your portfolios..."
                />
              </div>

              {submitError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                  {submitSuccess}
                </div>
              )}

              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-75"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
