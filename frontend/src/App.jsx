// import { GPTMap } from "./Components/GPTMap";
import { Bounce, ToastContainer } from "react-toastify";

import { MyMap } from "./Components/Map/Map";

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
      <MyMap />
      {/* <GPTMap></GPTMap> */}
      {/* <WebSocketDemo></WebSocketDemo> */}
    </>
  );
}

export default App;
