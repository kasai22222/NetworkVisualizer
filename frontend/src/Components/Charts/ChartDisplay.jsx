import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const ChartDisplay = ({ sortedData, type = "bar" }) => {
  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart barGap={2} barSize={5} data={sortedData}>
          <CartesianGrid fill="white" strokeDasharray="3 3" />
          <XAxis dataKey="key" />
          <YAxis allowDecimals={false} domain={[0, "auto"]} />
          <Legend />
          <Bar dataKey="value" minPointSize={3}>
            <LabelList dataKey="value" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (type === "pie") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={sortedData}
            dataKey="value"
            nameKey="key"
            cx="50%"
            cy="50%"
            fill="#8884d8"
            label
          />
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
}; 
