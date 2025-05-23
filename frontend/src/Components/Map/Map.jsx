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

  const TIME_WINDOW = 2500
  const [currentTime, setCurrentTime] = useState(null);
  useEffect(() => {
    if (data.length > 0) {
      setCurrentTime(data[data.length - 1].Alert.Timestamp - 2000)
    }
  }, [data])
  useEffect(() => {
    let animationFrameId;
    let lastTimestamp = performance.now();

    const animate = (timestamp) => {
      const delta = timestamp - lastTimestamp;

      // Advance time based on real time elapsed
      setCurrentTime(prev => prev + delta * 2.5); // Speed factor: tweak "3" for faster/slower

      lastTimestamp = timestamp;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);
  const timeRange = [currentTime, currentTime + TIME_WINDOW]
  const layer = useMemo(() => new AnimatedArcLayer({
    id: "AnimatedArcLayer",
    data: data,
    getSourceTimestamp: d => d.Alert.Timestamp,
    getTargetTimestamp: d => d.Alert.Timestamp + 1700,
    getSourcePosition: (d) => [...d.Alert.SrcCoords, 10],
    getTargetPosition: (d) => destinationCoordinates ?? d.Alert.DstCoords,
    getHeight: () => 0.6,
    getSourceColor: (d) => [255, 0, 0, 255],// getColourByAlertPriority(d.Alert.Priority),
    getTargetColor: (d) => [255, 0, 0, 255], // getColourByAlertPriority(d.Alert.Priority),
    highlightedObjectIndex: currentObjectIndex,
    highlightColor: [0, 255, 0, 255],
    getWidth: 2,
    timeRange,
    pickable: true,
    onHover: (info) => {
      if (info.index != -1) {
        setCurrentObjectIndex(info.index);
        setCurrentDisplayedData(info.object);
      }
    },
  }), [data, timeRange]);// Add frame to dependencies to force layer update

  return (
    <div>
      <ItemFilterer />
      <DeckGL
        initialViewState={mapInitialViewState}
        controller
        layers={[layer]}
      >
        <MapLibreMap reuseMaps mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" />
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
