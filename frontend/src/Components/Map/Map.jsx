/*
 * TODO: Things to do in this file
 * Sort out data not showing up on refresh (The frontend has all the data but for some reason does not load the data between initial connect to backend and after refresh (I think??))
 */

import React, { useEffect, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { ArcLayer } from '@deck.gl/layers';
import { Map } from 'react-map-gl/maplibre';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import whyDidYouRender from '@welldone-software/why-did-you-render';
import { MapInfoBox } from './MapInfoBox';

// console.log(import.meta.env.DEV)




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
  // const [websocketUrl, setWebsocketUrl] = useState("ws://localhost:8080/ws")
  const { lastMessage, readyState } = useWebSocket(websocketUrl)
  const [currentShownData, setCurrentShownData] = useState("")

  //
  // const connectionStatus = {
  //   [ReadyState.CONNECTING]: 'Connecting',
  //   [ReadyState.OPEN]: 'Open',
  //   [ReadyState.CLOSING]: 'Closing',
  //   [ReadyState.CLOSED]: 'Closed',
  //   [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  // }[readyState];


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
  // useEffect(() => , processedData{
  //   const interval = setInterval(() => {
  //     setTime(Date.now());
  //   }, 50); // Update every 50ms for smoother animation

  // return () => clearInterval(interval); // Cleanup on unmount
  // }, []);

  useEffect(() => {
    if (lastMessage !== null && lastMessage.data.length >= 1) {
      let data = JSON.parse(lastMessage.data)
      let flattenedData = [];

      // FIXME: Need to merge all the alerts from one srcIp into one alert as it's rendering too many lines.
      // Maybe just use the data as is when it comes from the backend?
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
      let items = flattenedData.filter((d) => d.Alert.SrcCoords[0] != 0 && d.Alert.DstCoords[0] != 0)
      // TESTING:
      items = items.slice(flattenedData.length - 1000, flattenedData.length - 1)
      // let items = flattenedData
      // if (items.length > 1) {
      //   setHasData(true)
      // }
      // console.log("COUNT: ", count)
      // console.log("OLD ITEMS COUNT: ", processedData.length)
      setProcessedData((prev) => prev.concat(items))
      setMessageHistory((prev) => prev.concat(lastMessage))

      // console.log(processedData)
    }
  }, [lastMessage]);

  useEffect(() => {
    let count = 0
    // console.log(typeof processedData)
    // console.log(processedData)
    processedData.forEach((x) => {
      count = count + x.Count
    })
    // for (var x in processedData) {
    //   console.log(x)
    // }
    // console.log("NEW ITEMS COUNT: ", count)
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
      <MapInfoBox processedData={processedData}></MapInfoBox>
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
