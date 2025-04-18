
import React, { useEffect, useState, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { MapView, Map } from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import { ArcLayer } from '@deck.gl/layers';
import { parse } from 'date-fns';
import useWebSocket from 'react-use-websocket';

const INITIAL_VIEW_STATE = {
  longitude: 120,
  latitude: 30,
  zoom: 3,
  pitch: 0,
  bearing: 0,
};

const TIME_WINDOW = 2000; // 2 seconds
const TIME_OFFSET = 20000; // 20 seconds

// Define the structure of your WebSocket data.  This is CRUCIAL for TypeScript!
interface WebSocketData {
  [key: string]: { //  Rule ID (e.g., "1:11263:8")
    Message: string;
    Stats: {
      [ipAddress: string]: { // IP Address (e.g., "106.75.128.229")
        Count: number;
        Alert: {
          SrcIp: string;
          SrcCoords: [number, number];
          DstIp: string;
          DstCoords: [number, number];
          Priority: number;
          Timestamp: string; //  "04/18-04:14:57.924551"
        };
      };
    };
  };
}

interface ArcData {
  time1: number;
  lon1: number;
  lat1: number;
  alt1: number;
  time2: number;
  lon2: number;
  lat2: number;
  alt2: number;
  sourceIp: string; // Added source IP for tooltip
  destinationIp: string;
}

const parseTimestamp = (timestampString: string): number => {
  try {
    // Use date-fns to parse the timestamp string.  Check this format VERY carefully.
    const parsedDate = parse(timestampString, 'MM/dd-HH:mm:ss.SSSSSS', new Date());
    const timestamp = parsedDate.getTime();
    if (isNaN(timestamp)) {
      console.error("Invalid timestamp:", timestampString);
      return Date.now(); //  Return current time as fallback
    }
    return timestamp;
  } catch (error) {
    console.error("Error parsing timestamp:", timestampString, error);
    return Date.now(); // Return current time as fallback
  }
};

const transformWebSocketData = (data: WebSocketData): ArcData[] => {
  const arcs: ArcData[] = [];

  for (const ruleKey in data) {
    const ruleData = data[ruleKey];
    for (const ipAddress in ruleData.Stats) {
      const stat = ruleData.Stats[ipAddress];
      const alert = stat.Alert;

      // Parse the timestamp and add the offset
      const startTime = parseTimestamp(alert.Timestamp) + TIME_OFFSET;

      // Extract coordinates
      const sourceCoords = alert.SrcCoords;
      const destCoords = alert.DstCoords;

      // Check if coordinates are valid
      if (
        Array.isArray(sourceCoords) && sourceCoords.length === 2 &&
        Array.isArray(destCoords) && destCoords.length === 2 &&
        sourceCoords.every(Number.isFinite) && destCoords.every(Number.isFinite)
      ) {
        arcs.push({
          time1: startTime,
          lon1: sourceCoords[0],
          lat1: sourceCoords[1],
          alt1: 0,
          time2: startTime + TIME_WINDOW,
          lon2: destCoords[0],
          lat2: destCoords[1],
          alt2: 0,
          sourceIp: alert.SrcIp, // Store IP for tooltip
          destinationIp: alert.DstIp,
        });
      } else {
        console.warn("Invalid coordinates, skipping arc:", alert);
      }
    }
  }
  return arcs;
};

const MyMap = () => {
  const [arcsData, setArcsData] = useState<ArcData[]>([]);
  const [websocketUrl, setWebsocketUrl] = useState("ws://localhost:8080/ws"); //  Replace with your WebSocket URL
  const { lastMessage, readyState } = useWebSocket(websocketUrl);
  const [loading, setLoading] = useState(true);

  const updateArcsData = useCallback((newArcs: ArcData[]) => {
    setArcsData(newArcs);
    setLoading(false); //  Move setLoading(false) here.
  }, []);

  useEffect(() => {
    if (readyState === 1 && lastMessage !== null) { // Only process if connected
      if (lastMessage.data === "finish") {
        updateArcsData([]);
        return;
      }

      try {
        const rawData: WebSocketData = JSON.parse(lastMessage.data);
        const transformedData: ArcData[] = transformWebSocketData(rawData);

        //  Instead of adding to previous state, replace it.
        updateArcsData(transformedData);

      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        setLoading(false); //  Set loading to false on error, too.
      }
    } else if (readyState === 0) {
      console.log("Connecting to WebSocket...");
      setLoading(true);
    } else if (readyState === 3) {
      console.log("WebSocket connection closed.");
      setLoading(false);
    }
  }, [lastMessage, readyState, updateArcsData]);

  const layer = [
    new ArcLayer<ArcData>({
      id: 'arc-layer',
      data: arcsData,
      getSourcePosition: (d) => [d.lon1, d.lat1, d.alt1],
      getTargetPosition: (d) => [d.lon2, d.lat2, d.alt2],
      getSourceColor: [63, 81, 181],  //  Purple
      getTargetColor: [63, 181, 173],  // Teal
      getWidth: 2,
      getTooltip: (d) =>
        d
          ? `Source IP: ${d.sourceIp}\nDestination IP: ${d.destinationIp}\nStart Time: ${new Date(
            d.time1
          ).toLocaleString()}\nEnd Time: ${new Date(d.time2).toLocaleString()}`
          : null,
    }),
  ];

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {loading ? (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          padding: '1rem',
          borderRadius: '0.5rem'
        }}>
          Loading...
        </div>
      ) : (
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller={true}
          layers={layer}
          mapLib={maplibregl}
          mapboxAccessToken={''} //  Important:  You'll need a Mapbox token, even for a non-Mapbox style.
        >
          <Map
            mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" // Or any other Mapbox style
          />
        </DeckGL>
      )}
    </div>
  );
};

export default MyMap;

