// client/src/WebSocketContext.js
import React, { createContext, useContext, useState } from 'react';
import useWebSocket from 'react-use-websocket';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);

  //For Server Hosting
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket('wss://doodledetectives.pro/ws/', {
    //queryParams: { username: 'myUsername' },
    onOpen: () => setConnected(true),
    onClose: () => setConnected(false),
  });

  // //For Local Hosting
  // const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket('ws://localhost:3000', {
  //   //queryParams: { username: 'myUsername' },
  //   onOpen: () => setConnected(true),
  //   onClose: () => setConnected(false),
  // });


  console.log('WebSocket readyState:', readyState);
  console.log('Last message:', lastJsonMessage);

  return (
    <WebSocketContext.Provider value={{ sendJsonMessage, lastJsonMessage, connected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => useContext(WebSocketContext);
