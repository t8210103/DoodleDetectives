// client/src/WebSocketContext.js
import React, { createContext, useContext, useState } from 'react';
import useWebSocket from 'react-use-websocket';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);

  // // For Server Hosting
  // const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket('wss://doodledetectives.pro/ws/', {
  //   //queryParams: { username: 'myUsername' },
  //   onOpen: () => setConnected(true),
  //   onClose: () => setConnected(false),
  //   onError: (event) => console.error('WebSocket error:', event)
  // });

  //For Local Hosting
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket('ws://localhost:3001', {
    //queryParams: { username: 'myUsername' },
    onOpen: () => setConnected(true),
    onClose: () => setConnected(false),
    onError: (event) => console.error('WebSocket error:', event)
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
