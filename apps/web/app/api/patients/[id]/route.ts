import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Patient from "@/app/models/Patient";
import { currentUser } from "@clerk/nextjs/server"; // ✅ ADD THIS

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    // ✅ 🔐 BACKEND PROTECTION (VERY IMPORTANT)
    const user = await currentUser();

    if (user?.publicMetadata?.role !== "admin") {
      return new Response("Unauthorized", { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    const patient = await Patient.findById(id);

    if (!patient) {
      return NextResponse.json({ error: "Patient record not found" }, { status: 404 });
    }

    return NextResponse.json(patient);

  } catch (error) {
    console.error("GET SINGLE PATIENT ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}