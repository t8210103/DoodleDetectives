const { guid, updateAvailableGames, updateLobbyState, visionAI } = require('../server/src/functions');

//hashmaps
const clients = {};
const games = {};

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8000 });

wss.on('connection', (ws) => {

  // Creating clientId
  const clientId = guid();
  console.log(`Client created with ID: ${clientId}`);

  clients[clientId] = {
    "connection": ws
  };

  const payload = {
      "method": "connect",
      "clientId": clientId,
      ...(Object.keys(games).length > 0 && { "games": games }) // Loads existing games
  };

  ws.send(JSON.stringify(payload));

  ws.on('open', () => console.log('Connection opened'));

  ws.on('message', (message) => {
    const result = JSON.parse(message);
    console.log('Received message:', result);

    if (result.method === "create") {
      const gameId = guid();
      const clientId = result.clientId;
      const numPlayers = result.numPlayers;

      games[gameId] = {
          "id": gameId,
          "toDraw": "Cat", // Replace this with a random word generator function if needed
          "numPlayers": numPlayers,
          "clients":[]
      }; 

      const payload = {
          "method": "join",
          "games": games,
          "gameId": gameId,
          "clientId": clientId
      };

      const con = clients[clientId].connection;

      // Update available games for all clients
      if (Object.keys(games).length > 0) {
          updateAvailableGames(games, clientId, clients);
      }

      // Send the game creation payload to the client
      con.send(JSON.stringify(payload));
    }

    if (result.method === "join") {

      //const games = result.games; //This game is not properly updated before "join"
      const gameId = result.gameId;
      const clientId = result.clientId;

      games[gameId].clients.push({
          "clientId": clientId,
          //more specs
      })

      // if (game.clients.length === 2) updateGameState();  // Only work for 2 people online
      //updateLobbyState(game, cliendId);

      const payload = {
          "method": "lobby",
          "games": games,
          "gameId": gameId //maybe a proble for many games sending the gameId to all
      }

      console.log(games[gameId]);

      Object.values(clients).forEach(c => { // Must send to ALL clients the new GAMES !!!!
        const con = c.connection;
        con.send(JSON.stringify(payload));
      })
    }
    // Send a response back to the client
    //ws.send(JSON.stringify({ response: `Server received: ${message}` }));
  });

  ws.on('close', () => {
    console.log('Connection closed');
    delete clients[clientId];
  });

});

console.log('WebSocket server running on ws://localhost:8000');
