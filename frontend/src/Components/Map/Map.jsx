import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import DeckGL from "@deck.gl/react";
import { Map as MapLibreMap } from "react-map-gl/maplibre";
import { MapInfoBox } from "./MapInfoBox";
import { DataContext } from "../../context/DataContext";
import { FilterContext } from "../../context/FilterContext";
import config from "../../../config";
import { ItemFilterer } from "./ItemFilterer/ItemFilterer";
import AnimatedArcLayer from "./AnimatedArcLayer";

const destinationCoordinates =
  import.meta.env.VITE_DEST_COORDS?.split(",").map(Number);

const mapInitialViewState = config.mapInitialViewState

export const MyMap = () => {
  const { data } = useContext(DataContext)
  const [currentDisplayedData, setCurrentDisplayedData] = useState({
    Alert: {},
    Message: ""
  });
  const [currentObjectIndex, setCurrentObjectIndex] = useState(-1);
  const [currentObjectKey, setCurrentObjectKey] = useState()
  const { itemFiltererValues } = useContext(FilterContext)
  const [frame, setFrame] = useState(0);
  const deckRef = useRef(null);

  // Force redraw on animation frame
  useEffect(() => {
    let animationFrameId;
    const animate = () => {
      setFrame(f => f + 1);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const layer = useMemo(() => new AnimatedArcLayer({
    id: "AnimatedArcLayer",
    data: data,
    duration: 1.5,
    getStartTime: (d) => d.Alert.StartTime || 0,
    getSourcePosition: (d) => d.Alert.SrcCoords,
    getTargetPosition: (d) => destinationCoordinates ?? d.Alert.DstCoords,
    getHeight: () => 0.6,
    getSourceColor: (d) => [255, 0, 0, 255],// getColourByAlertPriority(d.Alert.Priority),
    getTargetColor: (d) => [255, 240, 0, 255], // getColourByAlertPriority(d.Alert.Priority),
    highlightedObjectIndex: currentObjectIndex,
    highlightColor: [0, 255, 0, 255],
    getWidth: 2,
    pickable: true,
    onHover: (info) => {
      if (info.index != -1) {
        setCurrentObjectIndex(info.index);
        setCurrentDisplayedData(info.object);
      }
    },
  }), [data, currentObjectIndex, frame]); // Add frame to dependencies to force layer update

  return (
    <div>
      <ItemFilterer />
      <DeckGL
        ref={deckRef}
        initialViewState={mapInitialViewState}
        controller
        layers={[layer]}
      >
        <MapLibreMap mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" />
      </DeckGL>
      <MapInfoBox
        currentObjectKey={currentObjectKey}
        setCurrentObjectKey={setCurrentObjectKey}
        currentDisplayedData={currentDisplayedData}
        setCurrentDisplayedData={setCurrentDisplayedData}
        setCurrentObjectIndex={setCurrentObjectIndex}
      />
    </div>
  );
};