const { response } = require("express");
const http = require("http");
const app = require("express")();
app.get("/", (req, res)=> res.sendFile(__dirname + "/index.html"));
app.listen(8081, ()=>console.log("Listening on http port 8081"));
const WebSocketServer = require("websocket").server;

// hashmap
const clients = {};
const games = {};

const httpserver = http.createServer((req, res) => 
    console.log("Received an HTTP request")
);

const websocket = new WebSocketServer({
    "httpServer": httpserver
});

httpserver.listen(8080, () => console.log("Server is listening on port 8080"));

websocket.on("request", request => {
    //where new clients connect
    const connection = request.accept(null, request.origin);

    console.log("WebSocket connection accepted");

    //What to do when the connections first opens
    connection.on("open", () => console.log("Connection opened"));

    //What to do when the connections closes
    connection.on("close", () => {
        console.log("Connection closed");
        connections = connections.filter(conn => conn !== connection);
    });

    //What to do when the client messages - implementation basically
    connection.on("message", message => {

        const result = JSON.parse(message.utf8Data);

        if (result.method === "create") {
            const gameId = guid();
            const clientId = result.clientId;

            games[gameId] = {
                "id": gameId,
                "balls": 20,
                "clients": []
            }

            const payload = {
                "method": "create",
                "game": games[gameId]
            }

            const con = clients[clientId].connection;
            con.send(JSON.stringify(payload));
        }

        if (result.method === "join") {
            const clientId = result.clientId;
            const gameId = result.gameId;
            const game = games[gameId];

            const color = {"0": "Red", "1": "Green", "2": "Blue"} [game.clients.length] // return color of player according to length
            game.clients.push({
                "clientId": clientId,
                "color": color
            })

            if (game.clients.length === 3 || game.clients.length === 2) updateGameState();  // Only work for 3 people online

            const payload = {
                "method": "join",
                "game": game
            }

            game.clients.forEach(c => {
                const con = clients[clientId].connection;
                con.send(JSON.stringify(payload));
            })
        }

        if (result.method === "play") {
            const gameId = result.gameId;
            const game = games[gameId];
            const ballId = result.ballId;
            const color = result.color;

            let state = game.state;

            if (!state) {
                state = {};
            }

            state[ballId] = color;
            games[gameId].state = state;

        }
    });

    //Creating clientId
    const clientId = guid();
    clients[clientId] = {
        "connection": connection
    }

    const payload = {
        "method": "connect",
        "clientId": clientId
    }
    //Sending to the client
    connection.send(JSON.stringify(payload))
    console.log("Just sent:" + JSON.stringify(payload));
});


function updateGameState() {

    for (const g of Object.keys(games)) {
        const game = games[g]

        const payload = {
            "method": "update",
            "game": game
        }

        game.clients.forEach( c => {
            clients[c.clientId].connection.send(JSON.stringify(payload));
        })
    }

    setTimeout(updateGameState, 500)
}


//Generates unique id for users --> alternatively i can take the id from the connection
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}

const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
