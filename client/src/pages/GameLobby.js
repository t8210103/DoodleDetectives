import React, { useState, useEffect, useRef } from 'react';
import '../styles.css'
import { useWebSocketContext } from '../components/WebSocketContext.js';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';

function GameLobby() {
    const { sendJsonMessage, lastJsonMessage, connected } = useWebSocketContext();

    const navigate = useNavigate();
    const location = useLocation();
    const { payload } = location.state || {};

    const [userData, setUserData] = useState(payload.userData || null);
    const [game, setGame] = useState(payload.games[payload.gameId]);
    const flagRef = useRef(true);
    const [waitMessage, setWaitMessage] = useState();

    // When user goes back manually (arrows) 
    const navType = useNavigationType();
    useEffect(() => {

        if (navType === "POP") {
            navigate('/');
        }

    }, [navType]);
      

    useEffect(() => {

        if (flagRef.current) {
            sendJsonMessage(payload);
            flagRef.current = false;
        }

        if (lastJsonMessage != null) {

            const response = lastJsonMessage;
            
            if (response.method === "lobby" && response.gameId === payload.gameId) {
                
                const game = response.games[response.gameId];
                let pRemaining;

                if (game.clients.some(client => client.userData.clientId === userData.clientId)) {
                    pRemaining = game.numPlayers - game.clients.length;
                    setWaitMessage(`Waiting for ${pRemaining} more player(s) to join...`);
                    setGame(game);
                    if (pRemaining <= 0) {
                        
                        const payload = {
                            "method": "play",
                            "game": game,
                            "userData": userData
                        }

                        navigate('/GamePage', { state: { payload } });
                    }
                }
            }

        }
    }, [lastJsonMessage, sendJsonMessage, payload]);

    return (
        <div>
            <h1>Game Lobby</h1>
            <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
            <p id = "waitPlayers">{waitMessage}</p>
            <p>Difficulty: {game.difficulty}</p>
            <p>To draw: {game.toDraw}</p>
            <p id = "thisClient">ClientId: {userData.clientId}</p>
            <p>Game ID: {game.id}</p>
            <p>Game Target: {game.toDraw}</p>
        </div>
    );
}

export default GameLobby;