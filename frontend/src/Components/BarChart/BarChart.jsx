import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, LabelList, Legend, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import dataSortByX from "./dataSorting"

const HighestCountryBarChart = ({ data }) => {
  const [sortingSettings, setSortingSettings] = useState({
    groupBy: "country",
    sortDescending: true,
    topN: 5
  })

  const handleSortChange = (e) => {
    setSortingSettings(prev => ({
      ...prev,
      groupBy: e.target.value
    }))
  }

  const handleSortDirectionChange = (e) => {
    setSortingSettings(prev => ({
      ...prev,
      sortDescending: e.target.value === "descending"
    }))
  }

  const handleTopNChange = (e) => {
    const value = e.target.value === "all" ? null : parseInt(e.target.value)
    setSortingSettings(prev => ({
      ...prev,
      topN: value
    }))
  }

  const sortedData = dataSortByX(data, sortingSettings)

  return (
    <>
      <div className="absolute bg-black p-1 top-0 right-0 z-50">
        <select 
          value={sortingSettings.groupBy}
          onChange={handleSortChange}
          className="p-2 border rounded"
        >
          <option value="country">Country</option>
          <option value="ip">IP</option>
          <option value="rule">Rule</option>
          <option value="priority">Priority level</option>
        </select>

        <select 
          value={sortingSettings.sortDescending ? "descending" : "ascending"}
          onChange={handleSortDirectionChange}
          className="p-2 border rounded"
        >
          <option value="descending">Descending</option>
          <option value="ascending">Ascending</option>
        </select>

        <select 
          value={sortingSettings.topN || "all"}
          onChange={handleTopNChange}
          className="p-2 border rounded"
        >
          <option value="5">Top 5</option>
          <option value="10">Top 10</option>
          <option value="20">Top 20</option>
          <option value="all">All</option>
        </select>
      </div>

      <ResponsiveContainer className={"bg-white"} width="100%" height={"100%"}>
        <BarChart
          barGap={2}
          barSize={5}
          maxBarSize="2000"
          data={sortedData}
        >
          <CartesianGrid strokeDasharray={"3 3"} />
          <XAxis dataKey="key" />
          <YAxis />
          <YAxis scale="log" domain={['auto', 'auto']} />
          <Legend />
          <Bar dataKey="value" minPointSize={3}>
            <LabelList dataKey="value" position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </>
  )
}

export default HighestCountryBarChart
