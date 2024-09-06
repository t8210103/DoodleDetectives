// client/src/Main.js
import React, { useState, useEffect } from 'react';
import '../styles.css'
import { useWebSocketContext } from '../components/WebSocketContext.js';
import { useLocation, useNavigate } from 'react-router-dom';

function Main() {
  const { sendJsonMessage, lastJsonMessage, connected } = useWebSocketContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [userData, setUserData] = useState({});
  const [gameId, setGameId] = useState(null);
  const [numPlayers, setNumPlayers] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showDifficulty, setShowDifficulty] = useState(false);

  // When user redirects from a finished game
  useEffect(() => {
    const { userData: oldUserData } = location.state || {};
  
    if (oldUserData) {
      setUserData(oldUserData);
      console.log("oldUserData:", oldUserData);

      const payload = {
        "method": "getAllGames",
        "clientId": oldUserData.clientId
      }

      sendJsonMessage(payload);
    }
    
  }, []);

  const handleCreateGame = () => {
    setShowInput(true); // Show the input field when the button is clicked
  };

  const handleInputChangeOnCreate = (event) => {
    setNumPlayers(event.target.value);
  };

  // Choose players for game
  const handleKeyPressOnCreate = (event) => {
    if (event.key === "Enter") {
      if (!numPlayers || numPlayers <= 1 || numPlayers >= 11) {
        alert("Please enter a valid number of players. From 2-10");
      } else {
        setShowDifficulty(true);
      }
    }
  };

  // Choose game difficulty
  const handleDiffClick = (event) => {

    const difficulty = event.target.getAttribute('data-value');
    event.preventDefault();

    const payload = {
      "method": "create",
      "userData": userData,
      "numPlayers": numPlayers,
      "difficulty": difficulty
    };

    sendJsonMessage(payload);
    
  } 

  useEffect(() => {
 
    const divPlayers = document.getElementById("divPlayers");
    const divBoard = document.getElementById("divBoard");
    if (lastJsonMessage != null) {
      const response = lastJsonMessage;

      if (response.method === "allGames" || response.method === "connect") { // allGames comes from functions

        if (response.method === "connect") {
          setUserData(response.userData);
        }

        if (response.games) {

          while (divPlayers.firstChild) {
            divPlayers.removeChild(divPlayers.firstChild);
          }

          while (divBoard.firstChild) {
            divBoard.removeChild(divBoard.firstChild);
          }

          for (const gameId in response.games) {

            const game = response.games[gameId];
            
            //outside box
            const d = document.createElement("div");
            d.classList.add("availableGames");
            d.textContent = "Players:" + game.numPlayers + "\n Difficulty:" + game.difficulty + "\n GameId:" + game.id;
            divPlayers.appendChild(d);

            //inside join button
            const b = document.createElement("button");
            b.classList.add("joinButton");
            b.textContent = "Click to join game";
            b.addEventListener("click", e => { //Click to join a game
                const payload = {
                    "method": "join",
                    "userData": userData,
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
      
      if (response.method === "join") {

        const payload = {
          "method": "join",
          "games": response.games,
          "gameId": response.gameId,
          "userData": response.userData
        };

        navigate('/GameLobby', { state: { payload } });  // Check if navigate sends payload either way
      }
    }
  }, [lastJsonMessage, userData, gameId]);


  return (
    <div>
      <h1>React Client</h1>
      <h4>Welcome { userData.name } </h4>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>

      <button id="createBtn" className='createBtn' onClick={() => handleCreateGame()} disabled={!connected}>
        Create Game
      </button>
      {/* Conditionally render the input field */}
      {showInput && (
        <div id="inputContainer">
          <input required
            className="input-players"
            placeholder="How many players?"
            value={numPlayers}
            type='number'
            onChange={handleInputChangeOnCreate}
            onKeyDown={handleKeyPressOnCreate}
          />
        </div>    
      )}
      {showDifficulty && (
        <div class="diff-drop-down">
          <button class="diff-btn">Choose difficulty</button>
          <div class="diff-dropdown-content">
            <p data-value="easy" onClick={handleDiffClick}>Easy</p>
            <p data-value="medium" onClick={handleDiffClick}>Medium</p>
            <p data-value="hard" onClick={handleDiffClick}>Hard</p>
          </div>
        </div>
      )}

      <div id = "divPlayers"></div>
      <div id = "divBoard"></div>
      <div>{"ClientId: " + userData.clientId}</div>

      <div>
        <h2>Last Message:</h2>
        <pre>{JSON.stringify(lastJsonMessage, null, 2)}</pre>
      </div>
    </div>
  );
}

export default Main;
