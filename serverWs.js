const http = require("http");
const WebSocketServer = require("websocket").server;

// Array to store active connections
let connections = [];

// Create an HTTP server
const httpserver = http.createServer((req, res) => 
    console.log("Received an HTTP request")
);

// Pass the HTTP server to the WebSocket server
const websocket = new WebSocketServer({
    httpServer: httpserver
});

// Start the HTTP server
httpserver.listen(8080, () => console.log("Server is listening on port 8080"));

// Handle new WebSocket requests
websocket.on("request", request => {
    const connection = request.accept(null, request.origin);
    connections.push(connection);
    console.log("WebSocket connection accepted");

    connection.on("onopen", () => console.log("Connection opened"));

    connection.on("close", () => {
        console.log("Connection closed");
        connections = connections.filter(conn => conn !== connection);
    });

    connection.on("message", message => {
        if (message.type === 'utf8') {
            console.log(`Received message: ${message.utf8Data}`);
            connection.send(`Got your message: ${message.utf8Data}`);
        }
    });
    console.log(connection.connected);
    // Function to send messages to the client every 5 seconds
    function sendevery5seconds() {
        if (connection.connected) {
            connection.send(`Message ${Math.random()}`);
        }
        setTimeout(sendevery5seconds, 5000);
    }

    sendevery5seconds();
});
