/**
 * Bar chart for attendance percentages.
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";


function barColor(pct) {
  if (pct >= 85) return "#10b981";
  if (pct >= 75) return "#6366f1";
  if (pct >= 65) return "#f59e0b";
  return "#ef4444";
}

export default function AttendanceChart({ data }) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((d) => ({
    name: d.subject.length > 14 ? d.subject.slice(0, 12) + "…" : d.subject,
    fullName: d.subject,
    percentage: d.percentage,
  }));

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="name"
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            angle={-25}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            unit="%"
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "10px",
              color: "var(--text)",
            }}
            formatter={(value) => [`${value}%`, "Attendance"]}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.fullName || ""
            }
          />
          <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={barColor(entry.percentage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
