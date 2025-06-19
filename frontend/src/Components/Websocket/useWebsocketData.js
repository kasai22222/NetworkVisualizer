import { useEffect, useState, useRef } from "react";
import mqtt from "mqtt";

export const useWebsocketData = () => {
  const [message, setMessage] = useState(null);
  const [status, setStatus] = useState("Connecting");
  const clientRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  useEffect(() => {
    const connect = () => {
      setStatus("Connecting");
      const client = mqtt.connect('ws://192.168.0.12:9001', {
        keepalive: 30,
        reconnectPeriod: 0,  // 自動再接続OFFにする
        clientId: `client_${Math.random().toString(16).slice(2, 10)}`,
        clean: false,
      });

      clientRef.current = client;

      client.on('connect', () => {
        console.log('MQTT 接続成功');
        setStatus("Connected");
        client.publish('snort/alerts', JSON.stringify({ message: 'Hello from frontend!' }));
        client.subscribe('snort/alerts', (err) => {
          if (!err) {
            console.log('✅ トピック snort/alerts にサブスクライブ成功');
          } else {
            console.error('Subscribe error:', err);
          }
        });
      });

      client.on('message', (topic, payload) => {
        console.log(`📩 [${topic}] ${payload.toString()}`);
        try {
          const data = JSON.parse(payload.toString());
          setMessage(data);
        } catch (e) {
          console.error("Failed to parse message", e);
        }
      });

      client.on("error", (error) => {
        console.error("MQTT Client Error:", error);
        setStatus("Error");
        client.end();
      });

      client.on("close", () => {
        console.log("MQTT 接続切断 - 3秒後に再接続を試みます");
        setStatus("Disconnected");
        // 3秒後に再接続
        retryTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      });
    };

    connect();

    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      if (clientRef.current) {
        clientRef.current.end(true);
      }
    };
  }, []);

  return { message, status };
};
