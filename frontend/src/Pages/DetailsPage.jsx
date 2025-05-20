import { LocalBarChart } from "../Components/Charts/BarChart"
import { LocalChart } from "../Components/Charts/Chart"
import { LocalPieChart } from "../Components/Charts/PieChart"
import { MyMap } from "../Components/Map/Map"


const DetailsPage = () => {
  return (
    <div className="grid grid-cols-2 grid-rows-2 w-screen h-screen">
      <LocalChart className={"p-2 border-2"}><LocalBarChart /></LocalChart>
      <LocalChart className={"p-2 border-2"}><LocalPieChart /></LocalChart>
      {/* </div> */}

      {/* <div className="col-span-2"><MyMap /></div> */}

    </div >
  )
}

export default DetailsPage
