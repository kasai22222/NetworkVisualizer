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
  import.meta.env.VITE_DEST_COORDS?.split(",").map(Number);

export const MyMap = ({ processedData, MapInitialViewState }) => {
  const [currentDisplayedData, setCurrentDisplayedData] = useState({
    Alert: {},
    Message: ""
  });
  const [currentObjectIndex, setCurrentObjectIndex] =
    useState(-1);
  const [currentObjectKey, setCurrentObjectKey] = useState()
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
  //
  const layer = new ArcLayer({
    id: "ArcLayer",
    data: filteredItems,
    getSourcePosition: (d) => d.Alert.SrcCoords,
    getTargetPosition: (d) => destinationCoordinates ?? d.Alert.DstCoords,
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
      <DeckGL initialViewState={MapInitialViewState} controller layers={layer}>
        <MapLibreMap mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" />
      </DeckGL>
      <MapInfoBox
        currentObjectKey={currentObjectKey}
        setCurrentObjectKey={setCurrentObjectKey}
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
