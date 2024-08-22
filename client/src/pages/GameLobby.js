import React, { useState, useEffect } from 'react';
import '../styles.css'
import { useWebSocketContext } from '../components/WebSocketContext.js';
import { useLocation, useNavigate } from 'react-router-dom';

function GameLobby() {
    const { sendJsonMessage, lastJsonMessage, connected } = useWebSocketContext();

    const navigate = useNavigate();
    const location = useLocation();
    const { payload } = location.state || {}; // Fallback to an empty object if state is undefined

    const [clientId, setClientId] = useState(payload.clientId || null);
    const [game, setGame] = useState(payload.game);
    const [flag, setFlag] = useState(true); 

    useEffect(() => {

        if (flag) {
            sendJsonMessage(payload);
            setFlag(!flag);
        }

        const waitPlayers = document.getElementById("waitPlayers");

        if (lastJsonMessage != null) {

            const response = lastJsonMessage;
            
            if (response.method === "play") {
                setGame(response.game);
                waitPlayers.textContent = "Waiting for " + (response.game.numPlayers - response.game.clients.length) + " more players to join ..."
            }

        }
    }, [lastJsonMessage]);

    return (
        <div>
            <h1>Game Lobby</h1>
            <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
            <p id = "waitPlayers"></p>
            {/*{response && game ? (
                <div>
                    <p>Waiting for {response.game.numPlayers - response.game.clients.length} more players to join ...</p> 
                    <p>Method: {response.method}</p>
                    <p>Client ID: {clientId}</p>
                    <p>Game ID: {response.game.id}</p>
                    <p>Game Target: {response.game.toDraw}</p>
                </div>
            ) : (
            <p>No payload received.</p>
            )}*/}
        </div>
    );
}

export default GameLobby;