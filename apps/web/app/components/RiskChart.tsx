"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface RiskData {
  date: string;
  count: number;
}

export default function RiskChart({ data }: { data: RiskData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="mb-4 font-semibold">📊 Risk Trend</h3>

      {/* 🔥 HARDCODE SIZE (FINAL FIX) */}
      <AreaChart
        width={600}
        height={300}
        data={data}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#ef4444"
          fill="#ef4444"
        />
      </AreaChart>
    </div>
  );
}