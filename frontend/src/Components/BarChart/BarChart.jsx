import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"

const HighestCountryBarChart = ({ processedData }) => {

  return (
    <ResponsiveContainer className={"bg-white"} width="100%" height={"100%"}>
      <BarChart
        width={500}
        height={300}
        data={processedData}
      >
        <CartesianGrid strokeDasharray={"3 3"} />
        <XAxis dataKey={"Alert.SrcIp"} />
        <YAxis />
        <Legend />
        <Bar dataKey={"Count"} width={1} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default HighestCountryBarChart
