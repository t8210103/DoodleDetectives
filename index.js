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

websocket.on("request", request => {

});

//Generates unique id for users --> alternatively i can take the id from the connection
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}

const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
//detectWeb(filePath);
//detectLandmark(filePath);