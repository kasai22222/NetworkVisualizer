/*
 * TODO: Things to do in this file
 * Sort out data not showing up on refresh (The frontend has all the data but for some reason does not load the data between initial connect to backend and after refresh (I think??))
 */

import React, { useEffect, useState } from "react";
import DeckGL from "@deck.gl/react";
import { ArcLayer } from "@deck.gl/layers";
import { Map as MapLibreMap } from "react-map-gl/maplibre";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { MapInfoBox } from "./MapInfoBox";
import { AlertInfoBox } from "./AlertInfoBox";
import getColourByAlertPriority from "./utils/getColourByAlertPriority";
import { ItemFilterer } from "./ItemFilterer/ItemFilterer";

const destinationCoordinates =
  import.meta.env.VITE_DEST_COORDS?.split(",").map(Number) ?? [];

export const MyMap = ({ MapInitialViewState }) => {
  const [processedData, setProcessedData] = useState([]);
  const [mapArcs, setMapArcs] = useState([]);
  const [websocketUrl] = useState("wss://sv7n-pc.tailf5dd06.ts.net/ws");
  // const [websocketUrl, setWebsocketUrl] = useState("ws://localhost:3000/ws")
  const { lastMessage, readyState } = useWebSocket(websocketUrl);
  const [currentDisplayedData, setCurrentDisplayedData] = useState({
    Alert: {},
    Message: ""
  });
  const [currentObjectIndex, setCurrentObjectIndex] =
    useState(-1);
  const [filteredItems, setFilteredItems] = useState(
    processedData.sort((a, b) => {
      return b.Alert.Timestamp - a.Alert.Timestamp;
    })
  );
  const [itemFilters, setItemFilters] = useState({
    priority: 0,
    message: "",
    startDate: null,
    endDate: null,
  });
  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  // TODO: Move file processing into an async file
  useEffect(() => {
    if (lastMessage == null || lastMessage.data.length < 1) {
      return;
    }

    let data = JSON.parse(lastMessage.data);

    // FIXME: Need to merge all the alerts from one srcIp into one alert as it's rendering too many lines.
    // Maybe just use the data as is when it comes from the backend?
    let flattenedData = [];
    const arcs = new Map();
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

        let key = `${stats.Alert.SrcCoords.join(
          ","
        )}->${stats.Alert.DstCoords.join(",")}`;
        if (!arcs.has(key)) {
          arcs.set(key, {
            // srcCoords: alert.SrcCoords,
            // dstCoords: alert.DstCoords,
            // srcIp: alert.SrcIp,
            // dstIp: alert.DstIp,
            // priority: alert.Priority,
            Alert: stats.Alert,
            Message: msg.Message,
            // count: stats.Count,
            timestamp: alert.Timestamp,
          });
        }
      }
    }

    flattenedData = flattenedData.filter(
      (d) => d.Alert.SrcCoords[0] != 0 && d.Alert.DstCoords[0] != 0
    );

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
    setProcessedData((prev) => prev.concat(flattenedData));
    setMapArcs((prev) => prev.concat(items));
    // console.log(processedData)
  }, [lastMessage]);

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

  const layer = new ArcLayer({
    id: "ArcLayer",
    data: mapArcs,
    getSourcePosition: (d) => d.Alert.SrcCoords,
    getTargetPosition: () => destinationCoordinates,
    getHeight: () => 0.6,
    getSourceColor: (d) => getColourByAlertPriority(d.Alert.Priority),
    getTargetColor: (d) => getColourByAlertPriority(d.Alert.Priority),
    highlightedObjectIndex: currentObjectIndex,
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
        setCurrentObjectIndex(info.index);
        setCurrentDisplayedData(info.object);
      }
      //   console.log("INFO: ", info)
      //   console.log("OBJECT: ", info.object)
      //   setCurrentShownData(info.object.Alert)
    },
  });

  return (
    <div>
      <ItemFilterer setItemFilters={setItemFilters} />
      <p>{connectionStatus}</p>
      <DeckGL initialViewState={MapInitialViewState} controller layers={layer}>
        <MapLibreMap mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" />
      </DeckGL>
      <MapInfoBox
        setMapArcs={setMapArcs}
        itemFilters={itemFilters}
        currentObjectIndex={currentObjectIndex}
        setCurrentObjectIndex={setCurrentObjectIndex}
        filteredItems={filteredItems}
        setFilteredItems={setFilteredItems}
        processedData={processedData}
        currentDisplayedData={currentDisplayedData}
        setCurrentDisplayedData={setCurrentDisplayedData}
      />
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
