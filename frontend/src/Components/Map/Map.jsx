/*
 * TODO: Things to do in this file
 * Sort out data not showing up on refresh (The frontend has all the data but for some reason does not load the data between initial connect to backend and after refresh (I think??))
 */

import React, { useEffect, useState } from "react";
import DeckGL from "@deck.gl/react";
import { ArcLayer } from "@deck.gl/layers";
import { Map as MapLibreMap } from "react-map-gl/maplibre"
import useWebSocket, { ReadyState } from "react-use-websocket";
import whyDidYouRender from "@welldone-software/why-did-you-render";
import { MapInfoBox } from "./MapInfoBox";

// console.log(import.meta.env.DEV)

const destinationCoordinates = import.meta.env.VITE_DEST_COORDS.split(",").map((item) => {
  return Number(item)
});

console.log(destinationCoordinates)


const INITIAL_VIEW_STATE = {
  longitude: 30,
  latitude: 37.7853,
  zoom: 1.8,
  pitch: 60,
};

const AlertInfoBox = ({ data }) => {
  if (data == null) {
    return;
  }
  return (
    // FIXME: Make it look good with word wrapping and max width (max-w-[x] doesn't work)
    <div className="fixed left-0 top-0 bg-gray-600 z-50 p-2 rounded-2xl wrap-anywhere">
      <p>Priority: {data.Alert.Priority}</p>
      <p>Message: {data.Message}</p>
      <p>Source IP: {data.Alert.SrcIp}</p>
      <p>Destination IP: {data.Alert.DstIp}</p>
    </div>
  );
};

export const MyMap = () => {
  const [messageHistory, setMessageHistory] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [mapArcs, setMapArcs] = useState([])
  const [websocketUrl, setWebsocketUrl] = useState("ws://192.168.0.11:3000/ws");
  // const [websocketUrl, setWebsocketUrl] = useState("ws://localhost:3000/ws")
  const { lastMessage, readyState } = useWebSocket(websocketUrl);
  const [currentShownData, setCurrentShownData] = useState("");
  const [currentDisplayedData, setCurrentDisplayedData] = useState(null);
  const [currentHoveredObjectIndex, setCurrentHoveredObjectIndex] = useState(-1);
  const [filteredItems, setFilteredItems] = useState(
    processedData.sort((a, b) => {
      return b.Alert.Timestamp - a.Alert.Timestamp;
    })
  );
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  useEffect(() => {

  })

  useEffect(() => {
    if (lastMessage !== null && lastMessage.data.length >= 1) {
      let data = JSON.parse(lastMessage.data);

      // FIXME: Need to merge all the alerts from one srcIp into one alert as it's rendering too many lines.
      // Maybe just use the data as is when it comes from the backend?
      let flattenedData = [];
      (async () => {
        for (const ruleKey in data) {
          const ruleInfo = data[ruleKey];
          const msg = ruleInfo.Message;
          for (const srcIp in ruleInfo.Stats) {
            const stats = ruleInfo.Stats[srcIp];
            flattenedData.push({
              Alert: stats.Alert,
              Count: stats.Count,
              Rule: ruleKey,
              Message: msg,
            });
          }
        }
      })()

      let flattenedDataItems = flattenedData.filter(
        (d) => d.Alert.SrcCoords[0] != 0 && d.Alert.DstCoords[0] != 0
      );

      const arcs = new Map();

      for (const rule of Object.values(data)) {
        for (const stats of Object.values(rule.Stats)) {
          const alert = stats.Alert;
          const key = `${alert.SrcCoords.join(",")}->${alert.DstCoords.join(",")}`;

          if (!arcs.has(key)) {
            arcs.set(key, {
              // srcCoords: alert.SrcCoords,
              // dstCoords: alert.DstCoords,
              // srcIp: alert.SrcIp,
              // dstIp: alert.DstIp,
              // priority: alert.Priority,
              Alert: alert,
              Message: rule.Message,
              // count: stats.Count,
              timestamp: alert.Timestamp,
            });
          }
        }
      }

      let uniqueArcs = Array.from(arcs.values());
      let items = uniqueArcs.filter(
        (d) => d.Alert.SrcCoords[0] != 0 && d.Alert.DstCoords[0] != 0
      );

      // TESTING:
      // items = items.slice(
      //   flattenedData.length - 1000,
      //   flattenedData.length - 1
      // );
      // let items = flattenedData
      // if (items.length > 1) {
      //   setHasData(true)
      // }
      // console.log("COUNT: ", count)
      // console.log("OLD ITEMS COUNT: ", processedData.length)
      setProcessedData((prev) => prev.concat(flattenedDataItems));
      setMapArcs((prev) => prev.concat(items))
      setMessageHistory((prev) => prev.concat(lastMessage));

      // console.log(processedData)
    }
  }, [lastMessage]);

  useEffect(() => {
    let count = 0;
    // console.log(typeof processedData)
    // console.log(processedData)
    processedData.forEach((x) => {
      count = count + x.Count;
    });
    // for (var x in processedData) {
    //   console.log(x)
    // }
    // console.log("NEW ITEMS COUNT: ", count)
  }, [processedData]);

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
    data: mapArcs,
    getSourcePosition: (d) => d.Alert.SrcCoords,
    getTargetPosition: () => destinationCoordinates,
    getHeight: () => 0.6,
    getSourceColor: (d) => colourFromPriority(d.Alert.Priority),
    getTargetColor: (d) => colourFromPriority(d.Alert.Priority),
    highlightedObjectIndex: currentHoveredObjectIndex,
    highlightColor: [0, 255, 0, 255],
    transitions: {
      getSourceColor: {
        duration: 2000,
        enter: () => [255, 255, 255, 50],
      },
      getTargetColor: {
        duration: 2000,
        enter: () => [255, 255, 255, 50],
      },
    },
    // getTilt: (d) => d.Count * 0.8,
    // getSourcePosition: [-122.27, -37.80],
    // getTargetPosition: [125.8, 40.2],
    getWidth: 2,
    // greatCircle: true,
    pickable: true,
    //FIXME: Broken
    onHover: (info) => {
      if (info.index != -1) {
        setCurrentHoveredObjectIndex(info.index)
        setCurrentDisplayedData(info.object)
      }
      //   console.log("INFO: ", info)
      //   console.log("OBJECT: ", info.object)
      //   setCurrentShownData(info.object.Alert)
    }
  });

  return (
    <div>
      {/* <div className="z-50 bg-black p-2">{connectionStatus}</div> */}
      <AlertInfoBox data={currentDisplayedData} />
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller
        layers={layer}
      >
        <MapLibreMap mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" />
        {/* <MapView id="map" width="100%" controller >
        //   <Map mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" />
        // </MapView>
        */}
      </DeckGL>
      {/* {console.log(lastTenAlerts)} */}
      {/* <p>{lastTenAlerts[0].Rule}</p> */}
      {/* {lastTenAlerts.map((alert) => { */}
      {/*   { console.log(alert.Rule) } */}
      {/*   return <p>Alert: {alert.Rule.toString()}</p> */}
      {/* })} */}
      <MapInfoBox
        currentHoveredObjectIndex={currentHoveredObjectIndex}
        setCurrentHoveredObjectIndex={setCurrentHoveredObjectIndex}
        filteredItems={filteredItems}
        setFilteredItems={setFilteredItems}
        processedData={processedData}
        setCurrentDisplayedData={setCurrentDisplayedData}
      ></MapInfoBox>
    </div>
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
};
