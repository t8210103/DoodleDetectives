// client/src/WebSocketContext.js
import React, { createContext, useContext, useState } from 'react';
import useWebSocket from 'react-use-websocket';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket('ws://localhost:8000', {
    //queryParams: { username: 'myUsername' },
    onOpen: () => setConnected(true),
    onClose: () => setConnected(false),
  });

  console.log('WebSocket readyState:', readyState);
  console.log('Last message:', lastJsonMessage);

  return (
    <WebSocketContext.Provider value={{ sendJsonMessage, lastJsonMessage, connected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => useContext(WebSocketContext);
