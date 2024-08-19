// client/src/Main.js
import React from 'react';
import { useWebSocketContext } from '../components/WebSocketContext.js';

function Main() {
  const { sendJsonMessage, lastJsonMessage, connected } = useWebSocketContext();

  const sendMessage = () => {
    console.log('Sending message...');
    sendJsonMessage({ message: 'Hello WebSocket!' });
  };

  return (
    <div>
      <h1>React Client</h1>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={sendMessage} disabled={!connected}>
        Send WebSocket Message
      </button>
      <div>
        <h2>Last Message:</h2>
        <pre>{JSON.stringify(lastJsonMessage, null, 2)}</pre>
      </div>
    </div>
  );
}

export default Main;
