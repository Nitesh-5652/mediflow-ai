import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Appointment from "@/app/models/Appointment";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const { patientId, date, time } = body;

    if (!patientId || !date || !time) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const appointment = await Appointment.create({
      patientId,
      date,
      time,
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("APPOINTMENT ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}