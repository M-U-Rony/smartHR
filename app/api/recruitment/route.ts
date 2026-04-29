import {
  applyCandidate,
  createJob,
  listCandidates,
  listJobs,
  shortlistCandidate,
} from "@/lib/recruitment-store";

type RecruitmentBody = {
  action?: string;
  jobId?: string;
  title?: string;
  department?: string;
  description?: string;
  candidateId?: string;
  name?: string;
  email?: string;
  resume?: string;
};

export async function GET() {
  return Response.json(
    {
      jobs: listJobs(),
      candidates: listCandidates(),
    },
    { status: 200 },
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RecruitmentBody;
    const action = body.action?.trim().toLowerCase() ?? "";

    if (action === "post-job") {
      const title = body.title?.trim() ?? "";
      const department = body.department?.trim() ?? "";
      const description = body.description?.trim() ?? "";

      if (!title || !department || !description) {
        return Response.json(
          { message: "Title, department, and description are required." },
          { status: 400 },
        );
      }

      const created = createJob({ title, department, description });
      return Response.json({ job: created.job }, { status: 201 });
    }

    if (action === "apply") {
      const jobId = body.jobId?.trim() ?? "";
      const name = body.name?.trim() ?? "";
      const email = body.email?.trim() ?? "";
      const resume = body.resume?.trim() ?? "";

      if (!jobId || !name || !email || !resume) {
        return Response.json(
          { message: "Job, candidate name, email, and resume are required." },
          { status: 400 },
        );
      }

      const applied = applyCandidate({ jobId, name, email, resume });
      if (!applied.ok) {
        return Response.json({ message: applied.message }, { status: applied.status });
      }

      return Response.json({ candidate: applied.candidate }, { status: 201 });
    }

    if (action === "shortlist") {
      const candidateId = body.candidateId?.trim() ?? "";
      if (!candidateId) {
        return Response.json({ message: "Candidate id is required." }, { status: 400 });
      }

      const shortlisted = shortlistCandidate(candidateId);
      if (!shortlisted.ok) {
        return Response.json({ message: shortlisted.message }, { status: shortlisted.status });
      }

      return Response.json({ candidate: shortlisted.candidate }, { status: 200 });
    }

    return Response.json(
      { message: "Invalid action. Use post-job, apply, or shortlist." },
      { status: 400 },
    );
  } catch {
    return Response.json({ message: "Invalid request payload." }, { status: 400 });
  }
}
