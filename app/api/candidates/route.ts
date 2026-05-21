import { connectDB } from "@/db/mongoose";
import Candidate from "@/db/models/Candidate";
import Job from "@/db/models/Job";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");

    const filter = jobId ? { jobId } : {};
    const candidates = await Candidate.find(filter).sort({ createdAt: -1 });

    return Response.json(candidates, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to fetch candidates." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { jobId, name, email, phone, resume } = body;

    if (!jobId || !name || !email || !resume) {
      return Response.json({ message: "Job, Name, Email, and Resume are required." }, { status: 400 });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return Response.json({ message: "Job posting not found." }, { status: 404 });
    }

    const newCandidate = await Candidate.create({
      jobId,
      jobTitle: job.title,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || "",
      resume: resume.trim(),
      status: "applied",
      interviewScore: 0,
      notes: "",
    });

    return Response.json(newCandidate, { status: 201 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to submit candidate application." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, status, interviewScore, notes } = body;

    if (!id) {
      return Response.json({ message: "Candidate ID is required." }, { status: 400 });
    }

    const candidate = await Candidate.findById(id);
    if (!candidate) {
      return Response.json({ message: "Candidate not found." }, { status: 404 });
    }

    if (status !== undefined) candidate.status = status;
    if (interviewScore !== undefined) candidate.interviewScore = Number(interviewScore) || 0;
    if (notes !== undefined) candidate.notes = notes;

    await candidate.save();

    return Response.json(candidate, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to update candidate." }, { status: 500 });
  }
}
