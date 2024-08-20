// client/src/Main.js
import React, { useState, useEffect } from 'react';
import { useWebSocketContext } from '../components/WebSocketContext.js';

function Main() {
  const { sendJsonMessage, lastJsonMessage, connected } = useWebSocketContext();

  const [clientId, setClientId] = useState(null);
  const [gameId, setGameId] = useState(null);

  const createGame = () => {

    const payload = {
      "method": "create",
      "clientId": clientId,
      //"numPlayers": players
    }

    sendJsonMessage(payload);

  }

  useEffect(() => {  //Basically the on.message
 
    const divPlayers = document.getElementById("divPlayers");
    const divBoard = document.getElementById("divBoard");
    if (lastJsonMessage != null) {
      const response = lastJsonMessage;

      if (response.method === "allGames" || response.method === "connect") {

        if (response.method === "connect") {
          setClientId(response.clientId);
          console.log("inside connect client method, clientId: " +  clientId);
        }

        if (response.games) {

          var game;

          console.log(response.games);
          console.log("Hi");

          while (divPlayers.firstChild) {
            divPlayers.removeChild(divPlayers.firstChild);
          }

          while (divBoard.firstChild) {
            divBoard.removeChild(divBoard.firstChild);
          }

          for (const gameId in response.games) {
            game = response.games[gameId]; //each game
            //outside box
            const d = document.createElement("div");
            d.classList.add("availableGames");
            d.textContent = game.id;
            divPlayers.appendChild(d);

            //inside button - join button
            const b = document.createElement("button");
            b.classList.add("joinButton");
            b.textContent = "Click to join game";
            b.addEventListener("click", e => { //Click to join a game
                const payload = {
                    "method": "join",
                    "clientId": clientId,
                    "game": game
                }
                // window.location.href = `gameLobby.html?payload=${encodeURIComponent(JSON.stringify(payload))}`;

            })
            d.appendChild(b)
            divPlayers.appendChild(d);
          }
        }
      }

      if (response.method === "create") {

        console.log(response.game);
        const payload = {
            "method": "join",
            "clientId": response.clientId,
            "game": response.game
        }

        /*const stringPayload = JSON.stringify(payload);
        const myURL = new URL(`http://localhost:9090/gameLobby.html`);
        myURL.searchParams.set("payload", stringPayload);
        window.location.href = myURL.href;*/
        
        // Handle navigation to the game lobby
        /*
        function navigateToGameLobby(payload) {
            const stringPayload = JSON.stringify(payload);

            // Dynamically load the gameLobby content, avoiding full page reload
            fetch(`/gameLobby.html`)
                .then(response => response.text())
                .then(html => {
                    document.getElementById('content').innerHTML = html;
                    
                    // Initialize gameLobby.js or inline script execution
                    initGameLobby(stringPayload);  // You'd define this function to handle game lobby initialization
                });

            // Maintain WebSocket connection here or establish a new one in gameLobby
        }
            */


        // window.location.href = `gameLobby.html?payload=${encodeURIComponent(JSON.stringify(payload))}`;  //Fix this so that objects go through - WORSE case recreate object with data (if absolutely necessary - bad solution)
      }
    }
  }, [lastJsonMessage]);


  return (
    <div>
      <h1>React Client</h1>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
      <button id = "btnCreate" onClick={() => createGame()} disabled={!connected}>
        Create Game
      </button>
      <div id = "divPlayers"></div>
      <div id = "divBoard"></div>
      <div>
        <h2>Last Message:</h2>
        <pre>{JSON.stringify(lastJsonMessage, null, 2)}</pre>
      </div>
    </div>
  );
}

export default Main;
