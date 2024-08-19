const { guid, updateAvailableGames, updateLobbyState, visionAI } = require('../server/src/functions');

//hashmaps
const clients = {};
const games = {};

//websockets
//const { response, json } = require("express"); 
const http = require("http");
const express = require("express");
const WebSocketServer = require("websocket").server;

// Setup the main app (for main.html)
const appMain = express();
const mainServer = http.createServer(appMain);
appMain.use(express.static(__dirname + '/public'));
appMain.get("/", (req, res) => res.sendFile(__dirname + "/public/main.html"));
mainServer.listen(8080, () => console.log("Listening on http port 8080 - main"));

// Setup the game app (for gameLobby.html)
const appGame = express();
const gameServer = http.createServer(appGame);
appGame.use(express.static(__dirname + '/public'));
appGame.get("/", (req, res) => res.sendFile(__dirname + "/public/gameLobby.html"));
gameServer.listen(9090, () => console.log("Listening on http port 9090 - gameLobby"));

// WebSocket server for main page
const wsServerMain = new WebSocketServer({
    httpServer: mainServer,
});



wsServerMain.on("request", request => {        //when each client first connects

    //where new clients connect
    const connection = request.accept(null, request.origin);

    //what to do when the connections first opens
    connection.on("open", () => console.log("Connection opened"));

    //what to do when the connections closes
    connection.on("close", () => {
        console.log("Connection closed");
        delete clients[clientId];
    });

    //Creating clientId
    const clientId = guid();
    console.log(clientId);
    clients[clientId] = {
        "connection": connection
    }

    
    const payload = {
        "method": "connect",
        "clientId": clientId,
        ...(Object.keys(games).length > 0 && { "games": games }) // Basically if (games) { "games": games }
        //fill this
    }

    connection.send(JSON.stringify(payload));

    connection.on("message", message => { //where the important things happen -- the looped code

        result = JSON.parse(message.utf8Data);

        if (result.method === "create") {
            const gameId = guid();
            const clientId = result.clientId;
            const players = result.players;

            games[gameId] = {
                "id": gameId,
                "toDraw": "Cat", // Connect a random word generator
                "players": players, //how many players should join before starting
                "clients": []
            }

            const payload = {
                "method": "create",
                "games": games,
                "game": games[gameId], // info necessary for auto joining the created game
                "clientId": clientId
            }

            const con = clients[clientId].connection;

            if (Object.keys(games).length > 0 ) {
                updateAvailableGames(games, clientId, clients);
            }
            
            con.send(JSON.stringify(payload));        
            
        }

    });



});

//                                                                                       ---------------------
// WebSocket server for lobby page
const wsServerGame = new WebSocketServer({
    httpServer: gameServer,
});

wsServerGame.on('request', function(request) {

    //where new clients connect
    const connection = request.accept(null, request.origin);

    //what to do when the connections first opens
    connection.on("open", () => console.log("Connection opened"));

    //what to do when the connections closes
    connection.on("close", () => {
        console.log("Connection closed");
        delete clients[clientId];
    });
    
    const payload = {
        "method": "connect"
    }

    connection.send(JSON.stringify(payload));


    connection.on("message", message => { //where the important things happen -- the looped code

        result = JSON.parse(message.utf8Data);

        /* if (result.method === "connect") {
            clients[result.clientId] = {
                "connection": connection
            }
        }
        */

        if (result.method === "join") {  // Here make the game initiation logic??

            const game = result.game;
            const clientId = result.clientId;

            clients[result.clientId] = {
                "connection": connection
            }

            //const color = {"0": "Red", "1": "Green", "2": "Blue"} [game.clients.length] // return color of player according to length
            game.clients.push({
                "clientId": clientId,
                //"color": color
            })

            // if (game.clients.length === 2) updateGameState();  // Only work for 2 people online

            const payload = {
                "method": "join",
                "game": game
            }

            game.clients.forEach(c => {
                const con = clients[clientId].connection;
                con.send(JSON.stringify(payload));
            })
        }

        if (result.method === "waitPlayers") {
            updateLobbyState(response.game, response.clientId);
        }

        if (result.method === "check") {
            const base64String = result.base64String;
            
            const properties = []
            const clientId = result.clientId;
            const toDraw = "Cat"; // game[result.gameId].toDraw   -- see what else you have to get from URL in order for this to work
            const attempt = false;

            properties = visionAI(base64String);

            properties.forEach( prop => {
                if (prop == toDraw) {
                    attempt = true;
                }
            })
            
            games[gameId] = {
                "id": gameId,
                "clients": []
            }

            const payload = {
                "method": "check",
                "clientId": clientId,
                "attempt": attempt //True or False
            }

            const con = clients[clientId].connection;
            con.send(JSON.stringify(payload));
        }

    });

});