import { useContext } from "react"
import { DataContext } from "../../context/DataContext"
import { FilterContext } from "../../context/FilterContext"


const LineChartTemplate = (xAxis = "week") => {
  const { data } = useContext(DataContext)
  const { itemFiltererValues } = useContext(FilterContext)
  let xAxisData
  const getXAxisValues = () => {
    switch (xAxis) {
      case "week":
        return data.filter((item) => {
          return item.Alert.Timestamp
        })
    }
  }
  return (
    <div></div>
  )
}

export default LineChartTemplate
