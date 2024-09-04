const { guid, updateAvailableGames, updateLobbyState, visionAI } = require('../server/src/functions');

//hashmaps
const clients = {};
const games = {};
let lastStroke = false;

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8000 });

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

      games[gameId] = {
          "id": gameId,
          "toDraw": "Handwriting", // Replace this with a random word generator function
          "numPlayers": numPlayers,
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
    }

    if (result.method === "checkAI") {

      let found = false;
      let game = result.game;

      visionAI(result.base64String).then( descriptions => {
  
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

  });

  ws.on('close', () => {
    console.log('Connection closed');
    delete clients[userData.clientId];
  });

});

console.log('WebSocket server running on ws://localhost:8000');
