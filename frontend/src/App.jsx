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
import { Routes, Route } from "react-router";
import { Navbar } from "./Components/Navbar/Navbar";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1 w-full">
        <div className="h-[calc(100vh-4rem)]">
          <Routes>
            <Route path="/" element={<DetailsPage />} />
            <Route path="/map" element={<MyMap />} />
            <Route
              path="/barchart"
              element={
                <LocalChart>
                  <LocalBarChart />
                </LocalChart>
              }
            />
            <Route
              path="/piechart"
              element={
                <LocalChart>
                  <LocalPieChart />
                </LocalChart>
              }
            />
          </Routes>
        </div>
      </main>
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
    </div>
  );
}

export default App;
