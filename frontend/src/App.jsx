// import { GPTMap } from "./Components/GPTMap";
import { Bounce, ToastContainer } from "react-toastify";
import "./App.css";
import { MyMap } from "./Components/Map/Map";
import { useWebsocketData } from "./Components/Websocket/useWebsocketData";
import { useSearchParams } from "react-router";
import useProcessData from "./Components/Websocket/useProcessData";
import { LocalChart } from "./Components/Charts/Chart";
import { LocalBarChart } from "./Components/Charts/BarChart";
import { LocalPieChart } from "./Components/Charts/PieChart";
import DetailsPage from "./Pages/DetailsPage";
import { ItemFilterer } from "./Components/Map/ItemFilterer/ItemFilterer";


function App() {
  let [searchParams] = useSearchParams();
  let displaySearchParameter = searchParams.get("display")
  // const [filteredItems, setFilteredItems] = useState(
  //   processedData.sort((a, b) => {
  //     return b.Alert.Timestamp - a.Alert.Timestamp;
  //   })
  // );
  const getComponentToDisplay = (searchParameter) => {
    let defaultComponent = <DetailsPage />
    switch (searchParameter) {
      case "map":
        return <MyMap />
      case "barchart":
        return <LocalChart ><LocalBarChart /></LocalChart>
      case "piechart":
        return <LocalChart ><LocalPieChart /></LocalChart>
      default:
        return defaultComponent
    }
  }

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={1100}
        limit={2}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
        pauseOnFocusLoss={false}
        pauseOnHover={false}
        theme="dark"
        transition={Bounce}
      />
      {getComponentToDisplay(displaySearchParameter)}
      {/* <MyMap processedData={processedData} MapInitialViewState={config.MapInitialViewState} /> */}
      {/* <p className="absolute p-2 bg-black bottom-0 left-0 z-50">{connectionStatus}</p> */}
    </>
  );
}

export default App;
