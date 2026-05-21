import { connectDB } from "@/db/mongoose";
import Performance from "@/db/models/Performance";
import Employee from "@/db/models/Employee";
import { performanceSchema } from "@/zod";

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (email) {
      const evaluations = await Performance.find({ employeeEmail: email.toLowerCase() }).sort({ year: -1 });
      return Response.json(evaluations, { status: 200 });
    }

    const allEvaluations = await Performance.find({}).sort({ year: -1, createdAt: -1 });
    return Response.json(allEvaluations, { status: 200 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to fetch performance reviews." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const { employeeEmail, year, rating, comments, reviewedBy } = body;

    if (!employeeEmail || !year || !rating || !comments || !reviewedBy) {
      return Response.json({ message: "All fields are required." }, { status: 400 });
    }

    const employee = await Employee.findOne({ email: employeeEmail.toLowerCase().trim() });
    if (!employee) {
      return Response.json({ message: "Employee profile not found." }, { status: 404 });
    }

    const review = await Performance.create({
      employeeEmail: employee.email,
      employeeName: employee.name,
      year: Number(year),
      rating: Number(rating),
      comments: comments.trim(),
      reviewedBy: reviewedBy.trim(),
    });

    return Response.json(review, { status: 201 });
  } catch (error: any) {
    return Response.json({ message: error.message || "Failed to submit performance review." }, { status: 500 });
  }
}
