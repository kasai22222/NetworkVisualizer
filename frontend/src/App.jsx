// import { GPTMap } from "./Components/GPTMap";
import { Bounce, ToastContainer } from "react-toastify";
import "./App.css";
import { MyMap } from "./Components/Map/Map";
import config from "../config"
import { useWebsocketData } from "./Components/Websocket/useWebsocketData";
import HighestCountryBarChart from "./Components/BarChart/BarChart";
import { Route, Routes, useSearchParams } from "react-router";
import { useEffect } from "react";



function App() {
  const { processedData, connectionStatus, isoData } = useWebsocketData()
  let [searchParams] = useSearchParams();
  let displaySearchParameter = searchParams.get("display")

  const getComponentToDisplay = (searchParameter) => {
    let defaultComponent = <MyMap processedData={processedData} MapInitialViewState={config.MapInitialViewState} />
    switch (searchParameter) {
      case "map":
        return defaultComponent
      case "barchart":
        return <HighestCountryBarChart isoData={isoData} />
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
      <p>{connectionStatus}</p>
      {getComponentToDisplay(displaySearchParameter)}
      {/* <MyMap processedData={processedData} MapInitialViewState={config.MapInitialViewState} /> */}
    </>
  );
}

export default App;
