let socket;
let messageQueue = [];

export const connectWebsocket = (url) => {
  socket = new WebSocket(url);


  socket.onopen = () => {
    console.log("Websocket opened")
  }

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      messageQueue.push(data)
    }
    catch (err) {
      console.error("Failed to parse websocket message data: ", err)
    }
  }


  socket.onclose = () => {
    console.log("Websocket closed")
  }

  socket.onerror = (err) => {
    console.error("Websocket error: ", err)
  }
}
export const getMessageQueue = () => {
  const messages = [...messageQueue];
  messageQueue = []; // clear the queue
  return messages;
}

export const disconnectWebSocket = () => {
  if (socket) socket.close();
}
