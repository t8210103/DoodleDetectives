// server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8000 });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  // Send a welcome message when a client connects
  ws.send(JSON.stringify({ message: 'Welcome to the WebSocket server!' })); //send from srrver to client

  ws.on('message', (message) => {
    console.log('Received message:', JSON.parse(message));

    // Send a response back to the client
    ws.send(JSON.stringify({ response: `Server received: ${message}` }));
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

console.log('WebSocket server running on ws://localhost:8000');
