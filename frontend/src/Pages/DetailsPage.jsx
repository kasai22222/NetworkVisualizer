import '../../wdyr'
import { LocalBarChart } from "../Components/Charts/BarChart"
import { LocalChart } from "../Components/Charts/Chart"
import { LocalPieChart } from "../Components/Charts/PieChart"
import { MyMap } from "../Components/Map/Map"


const DetailsPage = () => {
  return (
    <div className="grid grid-cols-2 grid-rows-2 w-screen h-screen">
      <div className="col-span-2 flex">
        {/* <LocalChart><LocalBarChart /></LocalChart> */}
        {/* <LocalChart><LocalPieChart /></LocalChart> */}
        <LocalChart><LocalBarChart /></LocalChart>
      </div>

      {/* <div className="col-span-2"><MyMap /></div> */}

    </div >
  )
}

export default DetailsPage
