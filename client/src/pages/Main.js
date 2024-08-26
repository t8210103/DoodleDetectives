// client/src/Main.js
import React, { useState, useEffect } from 'react';
import '../styles.css'
import { useWebSocketContext } from '../components/WebSocketContext.js';
import { useNavigate } from 'react-router-dom';

function Main() {
  const { sendJsonMessage, lastJsonMessage, connected } = useWebSocketContext();
  const navigate = useNavigate();

  const [clientId, setClientId] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [numPlayers, setNumPlayers] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleCreateGame = () => {
    setShowInput(true); // Show the input field when the button is clicked
  };

  const handleInputChangeOnCreate = (event) => {
    setNumPlayers(event.target.value);
  };

  const handleKeyPressOnCreate = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      const payload = {
        method: "create",
        clientId: clientId,
        numPlayers: numPlayers
      };
      sendJsonMessage(payload);
    }
  };

  useEffect(() => {  //Basically the on.message
 
    const divPlayers = document.getElementById("divPlayers");
    const divBoard = document.getElementById("divBoard");
    if (lastJsonMessage != null) {
      const response = lastJsonMessage;

      if (response.method === "allGames" || response.method === "connect") {

        if (response.method === "connect") {
          setClientId(response.clientId);
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

          for (const gameId in response.games) { // IMPLEMENT useState for dynamic content

            //outside box
            const d = document.createElement("div");
            d.classList.add("availableGames");
            d.textContent = response.games[gameId].id;
            divPlayers.appendChild(d);

            //inside join button
            const b = document.createElement("button");
            b.classList.add("joinButton");
            b.textContent = "Click to join game";
            b.addEventListener("click", e => { //Click to join a game
                const payload = {
                    "method": "join",
                    "clientId": clientId, // OR "clientId": clientId,  --> check why it causes a problem (shouldn't it work since it is being set before???)
                    "games": response.games,
                    "gameId": gameId
                }
                navigate('/GameLobby', { state: { payload } });

            })
            d.appendChild(b)
            divPlayers.appendChild(d);
          }
        }
      }
      
      if (response.method === "join") { //Comes from server-create

        const payload = {
          "method": "join",
          "games": response.games,
          "gameId": response.gameId,
          "clientId": response.clientId
        };

        navigate('/GameLobby', { state: { payload } });  // Check if navigate sends payload either way
      }
    }
  }, [lastJsonMessage, clientId]);


  return (
    <div>
      <h1>React Client</h1>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>

      <button id = "createBtn" onClick={() => handleCreateGame()} disabled={!connected}>
        Create Game
      </button>
      {/* Conditionally render the input field */}
      {showInput && (
        <div id="inputContainer">
          <input
            className="inputPlayers"
            placeholder="How many players?"
            value={numPlayers}
            onChange={handleInputChangeOnCreate}
            onKeyPress={handleKeyPressOnCreate}
          />
        </div>
      )}
      <div id = "divPlayers"></div>
      <div id = "divBoard"></div>
      <div>{"clientId:" + clientId}</div>

      <div>
        <h2>Last Message:</h2>
        <pre>{JSON.stringify(lastJsonMessage, null, 2)}</pre>
      </div>
    </div>
  );
}

export default Main;
