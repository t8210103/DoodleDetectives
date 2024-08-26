import React, { useState, useEffect } from 'react';
import '../styles.css'
import { useWebSocketContext } from '../components/WebSocketContext.js';
import EachPlayer from '../components/EachPlayer.js';
import { useLocation, useNavigate } from 'react-router-dom';

function GamePage() {
    const { sendJsonMessage, lastJsonMessage, connected } = useWebSocketContext();

    const navigate = useNavigate();
    const location = useLocation();
    const { payload } = location.state || {};
    const [userData, setUserData] = useState(payload.userData || null);
    const [game, setGame] = useState(payload.game || null);

    useEffect(() => { 

        if (lastJsonMessage != null) {

            const response = lastJsonMessage;
                
            if (response.method === "play") { 

            }

        }

    }, [lastJsonMessage, sendJsonMessage, payload])

    return (
        <div>
            <EachPlayer game={game} userData={userData} />
        </div>
    );
}

export default GamePage;