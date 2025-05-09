// import { GPTMap } from "./Components/GPTMap";
import { Bounce, ToastContainer } from "react-toastify";
import "./App.css";
import { MyMap } from "./Components/Map/Map";
import config from "../config"

function App() {
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
      <MyMap MapInitialViewState={config.MapInitialViewState} />
      {/* <GPTMap></GPTMap> */}
      {/* <WebSocketDemo></WebSocketDemo> */}
    </>
  );
}

export default App;
