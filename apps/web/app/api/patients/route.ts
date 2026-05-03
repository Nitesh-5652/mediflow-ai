import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Patient from "../../models/Patient";

export async function GET() {
  try {
    await connectDB();
    const patients = await Patient.find().sort({ createdAt: -1 });
    return NextResponse.json(patients);
  } catch (error) {
    console.error("GET_PATIENTS_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body) return NextResponse.json({ error: "Missing body" }, { status: 400 });

    const newPatient = await Patient.create(body);
    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    console.error("POST_PATIENT_ERROR:", error);
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    const updated = await Patient.findByIdAndUpdate(
      body.id,
      {
        // Support for Manual Edits
        ...(body.name && { name: body.name }),
        ...(body.age && { age: body.age }),
        ...(body.disease && { disease: body.disease }),

        // Support for AI Analysis Updates
        ...(body.risk && {
          aiAnalysis: {
            risk: body.risk,
            suggestion: body.suggestion,
          },
        }),
      },
      { returnDocument: "after" }
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH_ERROR:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID required for deletion" }, { status: 400 });
    }

    const deletedPatient = await Patient.findByIdAndDelete(id);

    if (!deletedPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully", id });
  } catch (error) {
    console.error("DELETE_ERROR:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}