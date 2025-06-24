import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import DeckGL from "@deck.gl/react";
import { Map as MapLibreMap } from "react-map-gl/maplibre";
import { MapInfoBox } from "./MapInfoBox";
import { DataContext } from "../../context/DataContext";
import { FilterContext } from "../../context/FilterContext";
import config from "../../../config";
import { ItemFilterer } from "./ItemFilterer/ItemFilterer";
import AnimatedArcLayer from "./AnimatedArcLayer";
import { Scrubber } from "react-scrubber";
import 'react-scrubber/lib/scrubber.css'
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
  const [isPlaying, setIsPlaying] = useState(true);

  const TIME_WINDOW = 2500;
  const [currentTime, setCurrentTime] = useState(null);
  const [timeRange, setTimeRange] = useState({ min: 0, max: 0 });
  const animationRef = useRef(null);
  const lastTimestampRef = useRef(performance.now());

  // Initialize time values when data is first loaded
  useEffect(() => {
    if (data.length > 0) {
      const timestamps = data.map(d => d.Alert.Timestamp);
      const newMin = Math.min(...timestamps);
      const newMax = Math.max(...timestamps);

      setTimeRange(prev => ({
        min: prev.min === 0 ? newMin : prev.min,
        max: newMax
      }));

      if (currentTime === null) {
        setCurrentTime(newMin);
      }
    }
  }, [data]);

  // Animation effect
  useEffect(() => {
    if (!currentTime || !timeRange.max) return;

    const animate = (timestamp) => {
      if (!isPlaying) return;

      const delta = timestamp - lastTimestampRef.current;
      setCurrentTime(prev => {
        const newTime = prev + delta * 2;
        if (newTime >= timeRange.max) {
          return timeRange.min;
        }
        return newTime;
      });

      lastTimestampRef.current = timestamp;
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      lastTimestampRef.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, timeRange.max, timeRange.min]);

  const handleScrubberChange = (value) => {
    setCurrentTime(value);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const timeWindow = [currentTime, currentTime + TIME_WINDOW];
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
    timeRange: timeWindow,
    pickable: true,
    onHover: (info) => {
      if (info.index != -1) {
        setCurrentObjectIndex(info.index);
        setCurrentDisplayedData(info.object);
      }
    },
  }), [data, timeWindow]);// Add frame to dependencies to force layer update

  return (
    <div className="flex flex-col w-full h-full">
      {/* Map Container */}
      <div className="flex-1 relative">
        <DeckGL
          initialViewState={mapInitialViewState}
          controller
          layers={[layer]}
          style={{ width: '100%', height: '100%' }}
        >
          <MapLibreMap
            reuseMaps
            mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            style={{ width: '100%', height: '100%' }}
            attributionControl={false}
          />
        </DeckGL>

        {/* Filter Panel */}
        <div className="absolute top-6 right-6 z-10">
          <ItemFilterer />
        </div>

        {/* Time Controls */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-50 w-4/5 max-w-6xl">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <Scrubber
                value={currentTime}
                min={timeRange.min}
                max={timeRange.max}
                onScrubChange={handleScrubberChange}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="h-[300px]">
        <MapInfoBox
          currentObjectKey={currentObjectKey}
          setCurrentObjectKey={setCurrentObjectKey}
          currentDisplayedData={currentDisplayedData}
          setCurrentDisplayedData={setCurrentDisplayedData}
          setCurrentObjectIndex={setCurrentObjectIndex}
        />
      </div>
    </div>
  );
};
