import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Patient from "../../models/Patient";

/**
 * GET: Aggregates high-risk patient data from the last 7 days
 * Includes a fallback dummy data set for testing UI rendering.
 */
export async function GET() {
  try {
    await connectDB();

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const data = await Patient.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days },
          "aiAnalysis.risk": { $regex: "High", $options: "i" },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ]);

    const daysMap: Record<number, string> = {
      1: "Sun", 2: "Mon", 3: "Tue", 4: "Wed", 5: "Thu", 6: "Fri", 7: "Sat",
    };

    const result = data.map((item: any) => ({
      date: daysMap[item._id] || "Unknown",
      count: item.count,
    }));

    // QUICK TEST: Return dummy data if DB result is empty to verify Chart UI
    return NextResponse.json(
      result.length > 0
        ? result
        : [
            { date: "Mon", count: 2 },
            { date: "Tue", count: 1 },
            { date: "Wed", count: 3 },
            { date: "Thu", count: 2 },
          ]
    );
  } catch (error) {
    console.error("STATS_FETCH_ERROR:", error);
    // Fallback for total failure
    return NextResponse.json([
      { date: "Error", count: 0 }
    ]);
  }
}