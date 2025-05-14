import { useEffect } from "react"
import { Bar, BarChart, CartesianGrid, LabelList, Legend, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const HighestCountryBarChart = ({ isoData }) => {
  const { isoCountData, totalCount } = isoData
  const topN = 3;
  const sorted = [...isoCountData].sort((a, b) => b.count - a.count);
  const topEntries = sorted.slice(0, topN);
  const otherCount = sorted.slice(topN).reduce((sum, entry) => sum + entry.count, 0);
  topEntries.push({ isoCode: "Other", count: otherCount });
  useEffect(() => {
    console.log(isoCountData)
  }, [isoCountData])
  return (
    <ResponsiveContainer className={"bg-white"} width="100%" height={"100%"}>
      <BarChart

        barGap={2}
        barSize={500}
        maxBarSize="2000"
        data={topEntries}
      >
        <CartesianGrid strokeDasharray={"3 3"} />
        <XAxis dataKey={"isoCode"} />
        <YAxis scale="log" domain={['auto', 'auto']} />
        <Legend />
        <Bar dataKey={"count"} minPointSize={3} ><LabelList dataKey={"count"} position="top"></LabelList></Bar>
      </BarChart>
      <PieChart>
        <Pie
          data={topEntries}
          dataKey={"count"}
          nameKey={"isoCode"}
          cx="50%"
          cy="50%"
          label
        >
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}

export default HighestCountryBarChart
