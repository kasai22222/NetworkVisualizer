import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"


export const LocalPieChart = ({ sortedData }) => {
  return (
    <>
      {/* <ResponsiveContainer width="100%" height="100%"> */}
      {/*   <PieChart width={400} height={400}> */}
      {/*     <Pie */}
      {/*       dataKey="value" */}
      {/*       isAnimationActive={false} */}
      {/*       data={sortedData} */}
      {/*       cx="50%" */}
      {/*       cy="50%" */}
      {/*       outerRadius={80} */}
      {/*       fill="#8884d8" */}
      {/*       label */}
      {/*     /> */}
      {/*   </PieChart> */}
      {/* </ResponsiveContainer> */}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart width={400} height={400}>
          <Pie
            data={sortedData}
            dataKey={"value"}
            nameKey={"key"}
            cx="50%"
            cy="50%"
          />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </>
  )
}
