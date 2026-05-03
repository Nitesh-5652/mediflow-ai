import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

import Patient from "../../models/Patient";

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

    const daysMap: any = {
      1: "Sun", 2: "Mon", 3: "Tue", 4: "Wed", 5: "Thu", 6: "Fri", 7: "Sat",
    };

    const result = data.map((item: any) => ({
      date: daysMap[item._id],
      count: item.count,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("STATS ERROR:", error);
    return NextResponse.json([]);
  }
}