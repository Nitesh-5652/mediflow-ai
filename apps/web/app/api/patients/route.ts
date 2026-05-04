import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Patient from "../../models/Patient";

// ✅ GET: Public Access (100% Stable)
export async function GET() {
  try {
    await connectDB();
    const patients = await Patient.find().sort({ createdAt: -1 });
    return NextResponse.json(patients);
  } catch (error) {
    console.error("GET_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ✅ POST: Fast & Stable for Demo
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    if (!body) return NextResponse.json({ error: "Missing body" }, { status: 400 });

    const newPatient = await Patient.create(body);
    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}

// ✅ PATCH: Fix for Persistent Data (Suggestions won't disappear)
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updated = await Patient.findByIdAndUpdate(
      body.id,
      {
        ...(body.name && { name: body.name }),
        ...(body.age && { age: body.age }),
        ...(body.disease && { disease: body.disease }),
        // AI fields ko top-level par save kar rahe hain for 100% persistence
        ...(body.risk && { risk: body.risk }),
        ...(body.suggestion && { suggestion: body.suggestion }),
      },
      { returnDocument: "after" }
    );

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// ✅ DELETE: Clean Deletion
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { id } = await req.json();
    await Patient.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted", id });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
