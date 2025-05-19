import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export const LocalBarChart = ({ sortedData }) => {
  return (
    <ResponsiveContainer className={"bg-white"} width="100%" height={"100%"}>
      <BarChart barGap={2} barSize={5} data={sortedData}>
        <CartesianGrid strokeDasharray={"3 3"} />
        <XAxis dataKey="key" />
        <YAxis allowDecimals={false} domain={[0, "auto"]} />
        {/* <YAxis type="number" allowDecimals={false} domain={[2, 'auto']} orientation={"right"} /> */}
        <Legend />
        <Bar dataKey="value" minPointSize={3}>
          <LabelList dataKey="value" position="top" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
