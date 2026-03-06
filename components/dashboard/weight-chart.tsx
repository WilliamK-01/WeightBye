"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChartPoint = {
  date: string;
  weight: number;
  movingAverage: number;
};

export function WeightChart({ data }: { data: ChartPoint[] }) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Weight Trend</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120,120,120,0.2)" />
            <XAxis dataKey="date" tickFormatter={(value) => format(new Date(value), "MMM d")} />
            <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(2)} kg`}
              labelFormatter={(value) => format(new Date(value), "PP")}
              contentStyle={{ borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.3)" }}
            />
            <Legend />
            <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 2 }} name="Weight" />
            <Line type="monotone" dataKey="movingAverage" stroke="#22c55e" strokeWidth={2} dot={false} name="7-day Avg" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
