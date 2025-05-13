// import { GPTMap } from "./Components/GPTMap";
import { Bounce, ToastContainer } from "react-toastify";
import "./App.css";
import { MyMap } from "./Components/Map/Map";
import config from "../config"
import { useWebsocketData } from "./Components/Websocket/useWebsocketData";
import BarChart from "./Components/BarChart/BarChart";
import HighestCountryBarChart from "./Components/BarChart/BarChart";




function App() {
  const { processedData, connectionStatus } = useWebsocketData()
  return (
    <>
      <p>{connectionStatus}</p>
      <HighestCountryBarChart processedData={processedData} />
      {/* <ToastContainer */}
      {/*   position="top-right" */}
      {/*   autoClose={1100} */}
      {/*   limit={2} */}
      {/*   newestOnTop={false} */}
      {/*   closeOnClick */}
      {/*   rtl={false} */}
      {/*   draggable */}
      {/*   pauseOnFocusLoss={false} */}
      {/*   pauseOnHover={false} */}
      {/*   theme="dark" */}
      {/*   transition={Bounce} */}
      {/* /> */}
      {/* <MyMap processedData={processedData} MapInitialViewState={config.MapInitialViewState} /> */}
    </>
  );
}

export default App;
