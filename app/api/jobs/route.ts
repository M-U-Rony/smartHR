import { connectDB } from "@/db/mongoose";
import Job from "@/db/models/Job";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";

    const filter = all ? {} : { status: "active" as const };
    const jobs = await Job.find(filter).sort({ createdAt: -1 });

    return Response.json(jobs, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to fetch jobs." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { title, department, description, requirements } = body;

    if (!title || !department || !description || !requirements) {
      return Response.json({ message: "All fields are required." }, { status: 400 });
    }

    const newJob = await Job.create({
      title: title.trim(),
      department: department.trim(),
      description: description.trim(),
      requirements: requirements.trim(),
      status: "active",
    });

    return Response.json(newJob, { status: 201 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to post job." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return Response.json({ message: "Job ID and status are required." }, { status: 400 });
    }

    const job = await Job.findById(id);
    if (!job) {
      return Response.json({ message: "Job not found." }, { status: 404 });
    }

    job.status = status;
    await job.save();

    return Response.json(job, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to update job status." }, { status: 500 });
  }
}
