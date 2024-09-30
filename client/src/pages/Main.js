// client/src/Main.js
import React, { useState, useEffect, useRef } from 'react';
import '../styles.css'
import { useWebSocketContext } from '../components/WebSocketContext.js';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';

function Main() {
  const { sendJsonMessage, lastJsonMessage, connected } = useWebSocketContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [userData, setUserData] = useState({});
  const [gameId, setGameId] = useState(null);
  const [numPlayers, setNumPlayers] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {

    // When user redirects from a finished game
    const { userData: oldUserData } = location.state || {};
  
    if (oldUserData) {
      setUserData(oldUserData);
      console.log("oldUserData:", oldUserData);

      const payload = {
        "method": "getAllGames",
        "clientId": oldUserData.clientId,
      }

      sendJsonMessage(payload);
    }

    // if (!oldUserData && lastJsonMessage === null) {
      
    //   const storedUserData = localStorage.getItem('userData');

    //   if (storedUserData) {
    //     setUserData(storedUserData);

    //     const payload = {
    //       "method": "getAllGames",
    //       "clientId": storedUserData.clientId;
    //       "fromGame": true
    //     }

    //     sendJsonMessage(payload);
    //   }
    // }
    
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

          // After sign in
          const getUsername = async () => {
            try {

              const user = await getCurrentUser();
              setName(user.username); // The username of the signed-in user
              let data = response.userData;
              data.name = name;
              setUserData(data);
              localStorage.setItem('userData', JSON.stringify(data))

              return name;

            } catch (error) {
              console.error('Error fetching user info:', error);
            }
          };  

          getUsername();

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

            // Create outer game container
            const d = document.createElement("div");
            d.classList.add("availableGames");
        
            // Game information container
            const infoContainer = document.createElement("div");
            infoContainer.classList.add("gameInfo");
        
            const players = document.createElement("p");
            players.textContent = "Total players: " + game.numPlayers;
            infoContainer.appendChild(players);
        
            const difficulty = document.createElement("p");
            difficulty.textContent = "Difficulty: " + game.difficulty;
            infoContainer.appendChild(difficulty);
        
            /*const gameIdText = document.createElement("p");
            gameIdText.textContent = "Game ID: " + game.id;
            infoContainer.appendChild(gameIdText);*/

            const playersLeft = document.createElement("p");
            playersLeft.textContent = "Players Left: " + (game.numPlayers - game.clients.length);
            infoContainer.appendChild(playersLeft);
        
            d.appendChild(infoContainer);

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
            d.appendChild(b);
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
      <a href="https://auth.doodledetectives.pro/login">Sign In / Sign Up</a>

      <h1>React Client</h1>
      <h4>Welcome { name } </h4>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>

      <button id="createBtn" className='createBtn' onClick={() => handleCreateGame()} disabled={!connected}>
        Create Game
      </button>
      {/* Conditionally render the input field */}
      {showInput && (
        <div id="inputContainer">
          <input 
            required
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
        <div className="diff-drop-down">
          <button className="diff-btn">
            Choose difficulty
          </button>
          <div className="diff-dropdown-content">
            <p data-value="easy" onClick={handleDiffClick}>Easy</p>
            <p data-value="medium" onClick={handleDiffClick}>Medium</p>
            <p data-value="hard" onClick={handleDiffClick}>Hard</p>
          </div>
        </div>
      )}

      <div id = "divPlayers"></div>
      <div id = "divBoard"></div>

      <div>
        <h2>Last Message:</h2>
        <pre>{JSON.stringify(lastJsonMessage, null, 2)}</pre>
      </div>
      <div>
        <h2>Client Id:</h2>
        <pre>{userData.clientId}</pre>
      </div>
    </div>
  );
}

export default Main;
