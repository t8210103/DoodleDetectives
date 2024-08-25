import React, { useState, useEffect, useRef } from 'react';
import '../styles.css'
import { useWebSocketContext } from '../components/WebSocketContext.js';
import { useLocation, useNavigate } from 'react-router-dom';

function GameLobby() {
    const { sendJsonMessage, lastJsonMessage, connected } = useWebSocketContext();

    const navigate = useNavigate();
    const location = useLocation();
    const { payload } = location.state || {}; // Fallback to an empty object if state is undefined

    const [clientId, setClientId] = useState(payload.clientId || null);
    const [game, setGame] = useState(payload.games[payload.gameId]);
    const flagRef = useRef(true);
    const [waitMessage, setWaitMessage] = useState();

    useEffect(() => {

        if (flagRef.current) {
            sendJsonMessage(payload);
            flagRef.current = false;
        }

        const waitPlayers = document.getElementById("waitPlayers");

        if (lastJsonMessage != null) {

            const response = lastJsonMessage;
            
            if (response.method === "lobby" && response.gameId === payload.gameId) {
                
                const game = response.games[response.gameId];

                console.log(clientId);
                if (game.clients.some(client => client.clientId === clientId)) {
                    setWaitMessage(`Waiting for ${game.numPlayers - game.clients.length} more player(s) to join...`);
                    setGame(game);
                }
            }

        }
    }, [lastJsonMessage, sendJsonMessage, payload]);

    return (
        <div>
            <h1>Game Lobby</h1>
            <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
            <p id = "waitPlayers">{waitMessage}</p>
            <p id = "thisClient">ClientId: {clientId}</p>
            <p>Game ID: {game.id}</p>
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