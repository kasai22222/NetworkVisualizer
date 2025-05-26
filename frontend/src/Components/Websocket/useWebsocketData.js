import { useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

// let backendHostname = import.meta.env.VITE_BACKEND_HOST
// backendHostname = backendHostname == "" ? "backend" : backendHostname

export const useWebsocketData = () => {
  const { lastMessage, readyState } = useWebSocket('ws://192.168.0.11:3001/ws')
  // const { lastMessage, readyState } = useWebSocket(`/ws`);
  // const [concatIsoData, setConcatIsoData] = useState({ test: isoCountData, test2: 0 })



  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];
  return {
    lastMessage, connectionStatus
  };
};

