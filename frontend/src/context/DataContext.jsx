import { createContext, useContext, useEffect, useState } from "react"
import { ReadyState } from "react-use-websocket"
import filterItems from "../Components/Map/ItemFilterer/filterItems"
import useProcessData from "../Components/Websocket/useProcessData"
import { useWebsocketData } from "../Components/Websocket/useWebsocketData"
import { FilterContext } from "./FilterContext"

const DataContext = createContext({
  data: {},
  connectionStatus: ReadyState.CLOSED
})
const DataProvider = ({ children }) => {
  const { itemFiltererValues } = useContext(FilterContext)
  const { lastMessage, connectionStatus } = useWebsocketData()
  const processedData = useProcessData(lastMessage)
  const [filteredItems, setFilteredItems] = useState(
    processedData.sort((a, b) => {
      return b.Alert.Timestamp - a.Alert.Timestamp;
    })
  );

  useEffect(() => {
    if (processedData.length < 1) {
      return
    }
    // FIXME: Show all data and don't slice
    console.log(processedData.length)
    setFilteredItems(filterItems(processedData.slice(0, 400), itemFiltererValues));
  }, [itemFiltererValues, processedData]);


  return (
    <DataContext.Provider value={{ data: filteredItems, connectionStatus: connectionStatus }} >{children}</DataContext.Provider>
  )
}

export { DataContext, DataProvider }
