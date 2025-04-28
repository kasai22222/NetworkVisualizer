// var CartoDB_DarkMatterNoLabels = L.tileLayer(
//   "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
//   {
//     attribution:
//       '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
//     subdomains: "abcd",
//     maxZoom: 20,
//   }

import React, { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { ArcLayer, LineLayer } from '@deck.gl/layers';
import { ZoomWidget } from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import { FirstPersonView, MapView } from 'deck.gl';
import { connectWebsocket, disconnectWebSocket, getMessageQueue } from "../utils/websocket.js";
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Clipboard } from 'lucide-react';
import { toast } from 'react-toastify';

const INITIAL_VIEW_STATE = {
  longitude: 30,
  latitude: 37.7853,
  zoom: 1.8,
  pitch: 60,
};


const filterItems = (processedData, { priority, message, startDate, endDate }) => {
  // debugger;
  console.log("processedData Count: ", processedData.length)
  console.log(`Priority: ${priority}\nmessage: ${message}`)
  let items =
    processedData.filter((item) => {
      // if (i < 10) {
      //   console.log(`TIMESTAMP: ${item.Alert.Timestamp}\nDATE: ${new Date(item.Alert.Timestamp)}`)
      // }
      const messageMatch = message == null || item.Message.toLowerCase().includes(message.toLowerCase())
      const priorityMatch =
        priority == null ||
        (item.Alert.Priority >= 1 &&
          item.Alert.Priority <= 10 &&
          item.Alert.Priority === priority);

      // let timestamp = item.Alert.Timestamp
      // const timestampMatch = (startDate == null && endDate == null) ||
      //   (startDate < timestamp && timestamp < endDate)

      return messageMatch && priorityMatch
    })

  return items

}

export const MyMap = () => {
  const [messageHistory, setMessageHistory] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [websocketUrl, setWebsocketUrl] = useState("ws://192.168.0.11:3000/ws")
  // const [websocketUrl, setWebsocketUrl] = useState("ws://localhost:8080/ws")
  const { lastMessage, readyState } = useWebSocket(websocketUrl)
  const [currentShownData, setCurrentShownData] = useState("")
  const [filteredItems, setFilteredItems] = useState(processedData)
  const [itemFilters, setItemFilters] = useState({
    priority: null,
    message: null,
    startDate: null,
    endDate: null
  })


  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];


  // useEffect(() => {
  //
  //   const highAlerts = processedData.filter((item) => item.Alert.Priority == 1).slice(0, 10)
  //   console.log(highAlerts)
  // }, [processedData])
  // const getPriorityOneAlerts = (alerts) => {
  //   let vals = []
  //   for (let i = 0; i < 10; i++) {
  //     if (alerts[i].Priority == 1) {
  //       vals.push(alerts[i])
  //     }
  //   }
  // }


  // const [time, setTime] = useState(Date.now());

  // Update the time to animate the arcs
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setTime(Date.now());
  //   }, 50); // Update every 50ms for smoother animation

  // return () => clearInterval(interval); // Cleanup on unmount
  // }, []);

  // const [hasData, setHasData] = useState(false)
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (lastMessage !== null && lastMessage.data.length >= 1) {
      if (lastMessage.data == "finish") {
        setProcessedData([])
        return
      }
      // if (hasData) {
      //   return
      // }
      let data = JSON.parse(lastMessage.data)
      let flattenedData = [];
      for (const ruleKey in data) {
        const ruleInfo = data[ruleKey]
        const msg = ruleInfo.Message
        for (const srcIp in ruleInfo.Stats) {
          const stats = ruleInfo.Stats[srcIp]
          setCount((prev) => prev + stats.Count)
          flattenedData.push({
            Alert: stats.Alert,
            Count: stats.Count,
            Rule: ruleKey,
            Message: msg
          })
        }
      }
      let items = flattenedData.filter((d) => d.Alert.SrcCoords[0] != 0 && d.Alert.DstCoords[0] != 0)
      // if (items.length > 1) {
      //   setHasData(true)
      // }
      setProcessedData((prev) => prev.concat(items))
      setMessageHistory((prev) => prev.concat(lastMessage))

      // console.log(processedData)
    }
  }, [lastMessage]);

  useEffect(() => {
    console.log("COUNT: ", count)
  })


  useEffect(() => {
    setFilteredItems(filterItems(processedData, itemFilters))
  }, [processedData, itemFilters])
  // return (
  //   <div>
  //     <span>The WebSocket is currently {connectionStatus}</span>
  //     {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
  //     <ul>
  //       {messageHistory.map((message, idx) => (
  //         <span key={idx}>{message ? message.data : null}</span>
  //       ))}
  //     </ul>
  //   </div>
  // )
  function colourFromPriority(priority, max = 10) {
    const inverted = Math.max(0, Math.min(priority - 1, max - 1)) / (max - 1); // normalize 0–1
    const gb = Math.floor(255 * inverted); // lower priority = redder (less green/blue)
    return [255, gb, gb]; // red channel always max
  }


  // useEffect(() => {
  //   console.log("Filtered: ", filteredItems)
  // }, [filteredItems])








  const layer = new ArcLayer({
    id: "ArcLayer",
    data: processedData,
    getSourcePosition: (d) => d.Alert.SrcCoords,
    getTargetPosition: (d) => d.Alert.DstCoords,
    getHeight: () => 0.6,
    getSourceColor: (d) => colourFromPriority(d.Alert.Priority),
    getTargetColor: (d) => colourFromPriority(d.Alert.Priority),
    transitions: {
      getSourceColor: {
        duration: 2000,
        enter: () => [255, 255, 255, 50]
      },
      getTargetColor: {
        duration: 2000,
        enter: () => [255, 255, 255, 50]

      }
    },
    // getTilt: (d) => d.Count * 0.8,
    // getSourcePosition: [-122.27, -37.80],
    // getTargetPosition: [125.8, 40.2],
    getWidth: 2,
    // greatCircle: true,
    pickable: true,
    onClick: (info) => setCurrentShownData(info.object.Alert),
    //FIXME: Broken 
    // onHover: (info) => {
    //   console.log("INFO: ", info)
    //   console.log("OBJECT: ", info.object)
    //   setCurrentShownData(info.object.Alert)
    // }
  })



  const InfoBox = ({ alerts }) => {
    const prettifyDate = (unixTime) => {
      let date = new Date(unixTime * 1000)
      let minutes
      if (date.getMinutes().toString().length == 1) {
        minutes = "0" + date.getMinutes()
      } else {
        minutes = date.getMinutes()
      }
      let month = date.getMonth() + 1 //NOTE:  date.getMonth return index based date :/

      return `${date.getFullYear()}/${month}/${date.getDate()} - ${date.getHours()}:${minutes}`
    }


    const checkScroll = (event) => {

      console.log(event.currentTarget.scrollTop)
    }



    const [itemIsHovered, setItemIsHovered] = useState(null)
    return (
      <div className='grid grid-cols-2 absolute h-66 bottom-0 bg-red-500 w-screen'>



        <div className='bg-gray-400 border-2 rounded-2xl w-full h-full'>
          <div className=''>
            <div className='p-4 z-[1000] bg-blue-400' onClick={() => {
              setItemFilters({
                priority: 2,
                message: "ICMP"
              })
              setFilteredItems(filterItems(processedData, itemFilters))
            }}></div>
          </div>
        </div>



        <div className='bg-slate-400 overflow-auto flex flex-col p-2 w-full h-full' onScroll={(event) => checkScroll(event)}>
          {alerts.map((item, i) => {
            return (
              <div key={i} className='flex items-center bg-slate-400 brightness-100 hover:cursor-pointer hover:brightness-105 border-2 border-t-0 first:border-t-2 justify-between w-full'>
                <p onMouseLeave={() => setItemIsHovered(null)} onMouseEnter={() => setItemIsHovered(i)} onClick={(event) => {
                  toast("Copied to Clipboard")
                  navigator.clipboard.writeText(event.target.textContent)
                }} className='grow' >{prettifyDate(item.Alert.Timestamp)} {item.Message}</p>
                {itemIsHovered === i && (
                  <div className='flex-shrink-0'>
                    <Clipboard />
                  </div>
                )}
              </div>
            )
          })}
        </div>


      </div >
    )
  }



  return (
    <>

      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller
        getTooltip={({ object }) => {
          if (!object) return null;
          const { Alert, Count, Message } = object;
          return `${Alert.SrcIp} →  ${Alert.DstIp}\nCount: ${Count}\nPriority: ${Alert.Priority}\n${Message}`
        }}
        layers={layer}
      >

        <Map mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" />
        {/* <MapView id="map" width="100%" controller >
        //   <Map mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" />
        // </MapView>
        */}


      </DeckGL >
      {/* {console.log(lastTenAlerts)} */}
      {/* <p>{lastTenAlerts[0].Rule}</p> */}
      {/* {lastTenAlerts.map((alert) => { */}
      {/*   { console.log(alert.Rule) } */}
      {/*   return <p>Alert: {alert.Rule.toString()}</p> */}
      {/* })} */}
      <InfoBox alerts={processedData.sort((a, b) => {
        return new Date(b.Alert.Timestamp) - new Date(a.Alert.Timestamp)
      })}></InfoBox>
    </>
  );



  // return (
  //   <Map initialViewState={{
  //     longitude: -122.4, latitude: 37.8,
  //     zoom: 14
  //   }}
  //     style={{ height: "100%", width: "100%" }}
  //     mapStyle="https://api.maptiler.com/maps/dataviz/style.json?key=hrp9I8G7p3Wn0lc5wH9U" />
  //
  // );
}
