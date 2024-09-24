const { guid, updateAvailableGames, updateLobbyState, visionAI, getRandomPrompt } = require('../server/src/functions');

//hashmaps
const clients = {};
const games = {};
let lastStroke = false;

const WebSocket = require('ws');
const http = require('http');
const express = require('express');
const path = require('path');

const app = express();
const httpServer = http.createServer(app);

// Create a WebSocket server attached to the HTTPS server
const wss = new WebSocket.Server({ server: httpServer });

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Define your API routes
app.get('/api/some-endpoint', (req, res) => {
    res.json({ message: "Hello from the API!" });
});

// Serve React app for all other requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the HTTP server
httpServer.listen(3001, '127.0.0.1', () => {
  console.log('HTTP and WebSocket server running on port 3001');
});


//random name generator - delete later
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomName() {
  const adjectives = ["Blue", "Fast", "Silent", "Bold", "Clever", "Bright"];
  const nouns = ["Tiger", "Eagle", "Panther", "Wolf", "Falcon", "Lion"];
  
  const randomAdjective = getRandomElement(adjectives);
  const randomNoun = getRandomElement(nouns);
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number

  return `${randomAdjective}${randomNoun}${randomNumber}`;
}

wss.on('connection', (ws) => {

  // Creating userData.clientId
  const userData = {
    "clientId": guid(),
    "name": generateRandomName(),
    "base64String": null
  };
  
  console.log(`Client created with ID: ${userData.clientId}`);

  clients[userData.clientId] = {
    "connection": ws
  };

  const payload = {
      "method": "connect",
      "userData": userData,
      ...(Object.keys(games).length > 0 && { "games": games }) // Loads existing games
  };

  ws.send(JSON.stringify(payload));

  ws.on('open', () => console.log('Connection opened'));

  ws.on('message', (message) => {
    const result = JSON.parse(message);

    //console.log('Received message:', result);

    if (result.method === "create") {
      const gameId = guid();
      const userData = result.userData;
      const numPlayers = result.numPlayers;
      const difficulty = result.difficulty;
      const randomWord = getRandomPrompt(difficulty);

      games[gameId] = {
          "id": gameId,
          "toDraw": randomWord, // easy or Mmedium
          "numPlayers": numPlayers,
          "difficulty": difficulty,
          "clients":[]
      };

      const payload = {
          "method": "join",
          "games": games,
          "gameId": gameId,
          "userData": userData
      };

      const con = clients[userData.clientId].connection;

      // Update available games for all clients
      if (Object.keys(games).length > 0) {
          updateAvailableGames(games, userData.clientId, clients);
      }

      con.send(JSON.stringify(payload));
    }

    if (result.method === "join") {

      const gameId = result.gameId;
      const userData = result.userData;

      games[gameId].clients.push({
          "userData": userData //contains specs like name (get from database), surname (get from database), points (get from database) etc
      })

      // if (game.clients.length === 2) updateGameState();
      const payload = {
          "method": "lobby",
          "games": games,
          "gameId": gameId
      }

      updateAvailableGames(games, userData.clientId, clients)

      console.log(games[gameId]);

      /* 
      -Send to all the clients the new games 
      -Because at this point the user hasn't joined the game fully yet - so i can't send it only to the game cients
      -Problem with sending the gameId to all clients
      -Handling the problem with: " If (response.gameId === payload.gameId) " on GameLobby.js - that way other games ignore the new game information
      */
      Object.values(clients).forEach(c => { 
        const con = c.connection;
        con.send(JSON.stringify(payload));
      })

      if (JSON.stringify(games[gameId].clients.length) === games[gameId].numPlayers) {
        delete games[gameId];
        updateAvailableGames(games, userData.clientId, clients);
      }

    }

    if (result.method === "getAllGames") {

      const payload = {
        "method": "allGames",
        "clientId": result.clientId,
        "games": games
      }

      // if (!clients[result.clientId]) {
      //   const ws = new WebSocket('ws://localhost:3000');

      //   clients[userData.clientId] = {
      //     "connection": ws
      //   };

      //   clients 

      // }

      const con = clients[result.clientId].connection;
      con.send(JSON.stringify(payload));
    }

    if (result.method === "checkAI") {

      let found = false;
      let game = result.game;

      visionAI(result.base64String).then( descriptions => {
        console.log(descriptions);
        if (descriptions.includes(game.toDraw)) {
          found = true;
        }
  
        const payload = {
          "method": "resultAI",
          "found": found
        }
  
        const con = clients[result.clientId].connection;
        con.send(JSON.stringify(payload));
        
      })
    }

    if (result.method === "updateDrawing") {

      if (lastStroke) {
        lastStroke = false
        let game = result.game;
        let clientId = result.clientId;
        let base64 = result.base64String;

        for (let client of game.clients) {
          if (client.userData && client.userData.clientId === clientId) {
            client.userData.base64String = base64;
            break;
          }
        }

        const payload = {
          "method": "updateOppDrawing",
          "game": game
        }

        game.clients.forEach(client => { 
          let clientId = client.userData.clientId

          if (clientId  && clients[clientId] && clients[clientId].connection) {

            const connection = clients[clientId].connection;
            connection.send(JSON.stringify(payload));

          }

        })

      } else {
        lastStroke = true;
      }
    }

    if (result.method === "newWin") {
      const winnerData = result.userData;
      const game = result.game;

      const payload = {
        "method": "playerLost",
        "winnerData": winnerData // To show who the winner was
      }

      for (let client of game.clients) {

        // Send payload to players that lost
        if (client.userData && client.userData.clientId != winnerData.clientId) {

          //client.userData.base64String = null; --> is done on server side
          const connection = clients[client.userData.clientId].connection;
          connection.send(JSON.stringify(payload));

        }

      }

    }

  });

  ws.on('close', () => {
    console.log('Connection closed');
    delete clients[userData.clientId];
  });

});

console.log('WebSocket server is running on port 3002');
