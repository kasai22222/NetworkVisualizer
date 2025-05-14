// useMapData.js

import { useState, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

const websocketUrl = import.meta.env.VITE_WEBSOCKET_URL;
export const useWebsocketData = () => {
  if (!websocketUrl || websocketUrl == "") {
    throw EvalError("Websocket url not defined")
  }
  const [processedData, setProcessedData] = useState([]);
  const { lastMessage, readyState } = useWebSocket(websocketUrl);
  const [isoCountData, setIsoCountData] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  // const [concatIsoData, setConcatIsoData] = useState({ test: isoCountData, test2: 0 })

  useEffect(() => {
    if (!lastMessage || !lastMessage.data || lastMessage.data.length < 1) return;

    let data;
    try {
      data = JSON.parse(lastMessage.data);
    } catch (error) {
      console.error("Invalid JSON from WebSocket:", error);
      return;
    }



    let flattenedData = [];
    let highestCountIsoCodes = [];
    const arcs = new Map();
    for (const ruleKey in data) {
      const ruleInfo = data[ruleKey];
      const msg = ruleInfo.Message;

      for (const srcIp in ruleInfo.Stats) {
        const stats = ruleInfo.Stats[srcIp];
        flattenedData.push();
        const entry = {
          Alert: stats.Alert,
          Count: stats.Count,
          Rule: ruleKey,
          Message: msg,
        }

        const key = `${stats.Alert.SrcCoords.join(",")}->${stats.Alert.DstCoords.join(",")}`;
        if (!arcs.has(key)) {
          arcs.set(key)
          flattenedData.push(entry)
          const iso = stats.Alert.SrcCountryInfo.IsoCode;

          if (!iso) continue;
          if (highestCountIsoCodes[iso]) {
            highestCountIsoCodes[iso] += stats.Count
          }
          else {
            highestCountIsoCodes[iso] = stats.Count;
          }
        }
      }
    }
    let isoData = Object.entries(highestCountIsoCodes).map(([isoCode, count]) => ({ isoCode, count }))
    setTotalCount(() => isoData.reduce((sum, entry) => sum + entry.count, 0))
    setIsoCountData((prev) => {
      const isoCountMap = {};
      for (const entry of prev) {
        isoCountMap[entry.isoCode] = entry.count;
      }
      for (const { isoCode, count } of isoData) {
        if (isoCountMap[isoCode]) {
          if (count != 0) {
            console.log(`INCREASED: ${isoCode} - ${count}`)
          }
          isoCountMap[isoCode] += count;
        } else {
          isoCountMap[isoCode] = count;
        }
      }
      return Object.entries(isoCountMap).map(([isoCode, count]) => ({ isoCode, count }));
    });
    flattenedData = flattenedData.filter(
      (d) => d.Alert.SrcCoords[0] !== 0 && d.Alert.DstCoords[0] !== 0
    );

    setProcessedData((prev) => prev.concat(flattenedData));
  }, [lastMessage]);


  useEffect(() => {
    console.log(processedData)
  }, [processedData])
  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];
  let isoData = { isoCountData, totalCount }
  return {
    processedData,
    connectionStatus,
    isoData
  };
};

