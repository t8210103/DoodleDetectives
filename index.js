//websockets
const { response, json } = require("express");
const http = require("http");
const app = require("express")();
app.get("/", (req, res)=> res.sendFile(__dirname + "/index.html"));
app.listen(8081, ()=>console.log("Listening on http port 8081"));
const WebSocketServer = require("websocket").server;


//websockets
const httpserver = http.createServer((req, res) => 
    console.log("Received an HTTP request")
);

const websocket = new WebSocketServer({
    "httpServer": httpserver
});

httpserver.listen(8080, () => console.log("Server is listening on port 8080"));

websocket.on("request", request => {        //when each client first connects

    //where new clients connect
    const connection = request.accept(null, request.origin);

    console.log("WebSocket connection accepted");

    //what to do when the connections first opens
    connection.on("open", () => console.log("Connection opened"));

    //what to do when the connections closes
    connection.on("close", () => {
        console.log("Connection closed");
        connections = connections.filter(conn => conn !== connection);
    });

    connection.on("message", message => { //where the important things happen -- the looped code

        const message = JSON.parse(message.utf8Data);

    });

    //Creating clientId
    const clientId = guid();
    clients[clientId] = {
        "connection": connection
    }

    
    const payload = {
        "method": "connect",
        "clientId": clientId
        //fill this
    }
    
    connection.send(JSON.stringify(payload))

});

//Generates unique id for users --> alternatively i can take the id from the connection
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}

const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
//detectWeb(filePath);
//detectLandmark(filePath);