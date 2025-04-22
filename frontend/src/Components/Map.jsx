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

const INITIAL_VIEW_STATE = {
  longitude: 30,
  latitude: 37.7853,
  zoom: 1.8,
  pitch: 60,
};




export const MyMap = () => {
  const [messageHistory, setMessageHistory] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [websocketUrl, setWebsocketUrl] = useState("ws://192.168.0.11:3000/ws")
  const { lastMessage, readyState } = useWebSocket(websocketUrl)
  const [currentShownData, setCurrentShownData] = useState("")

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];


  const [time, setTime] = useState(Date.now());

  // Update the time to animate the arcs
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(Date.now());
    }, 50); // Update every 50ms for smoother animation

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);
  useEffect(() => {
    if (lastMessage !== null) {
      if (lastMessage.data == "finish") {
        setProcessedData([])
        return
      }
      let data = JSON.parse(lastMessage.data)
      let flattenedData = [];
      for (const ruleKey in data) {
        const ruleInfo = data[ruleKey]
        const msg = ruleInfo.Message
        for (const srcIp in ruleInfo.Stats) {
          const stats = ruleInfo.Stats[srcIp]
          flattenedData.push({
            Alert: stats.Alert,
            Count: stats.Count,
            Rule: ruleKey,
            Message: msg
          })
        }
      }
      setProcessedData((prev) => prev.concat(flattenedData));
      setMessageHistory((prev) => prev.concat(lastMessage));

      // console.log(processedData)
    }
  }, [lastMessage]);
  useEffect(() => {
    console.log(processedData)
  }, [processedData])
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

  const layer = new ArcLayer({
    id: "ArcLayer",
    data: processedData,
    getSourcePosition: (d) => d.Alert.SrcCoords,
    getTargetPosition: (d) => d.Alert.DstCoords,
    getHeight: (d) => d.Alert.Priority * 0.3,
    getSourceColor: (d) => colourFromPriority(d.Alert.Priority),
    getTargetColor: (d) => colourFromPriority(d.Alert.Priority),
    // getTilt: (d) => d.Count * 0.8,
    // getSourcePosition: [-122.27, -37.80],
    // getTargetPosition: [125.8, 40.2],
    getWidth: 1,
    // greatCircle: true,
    pickable: true,
    onClick: (info) => setCurrentShownData(info.object.Alert),
    onHover: (info) => {
      console.log("INFO: ", info)
      console.log("OBJECT: ", info.object)
      setCurrentShownData(info.object.Alert)
    }
  })
  return (
    <>
      <div className='z-50 absolute bg-white p-7'>
        {currentShownData.SrcCoords}
      </div>
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

        <MapView id="map" width="100%" controller >
          <Map mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" />
        </MapView>


      </DeckGL >
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
