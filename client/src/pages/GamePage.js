import React, { useState, useEffect, useRef } from 'react';
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
    const oppDataList = game.clients.filter(client => client.userData.clientId !== userData.clientId);
    const iRef = useRef(0);
    const [oppData, setOppData] = useState(oppDataList[iRef.current].userData ||null);

    const changeOpp = () => {
        iRef.current = (iRef.current + 1) % (game.clients.length - 1);
        console.log(iRef.current);
        setOppData(oppDataList[iRef.current].userData);
    }
    
    useEffect(() => { 

        if (lastJsonMessage != null) {

            const response = lastJsonMessage;
            // filter the game.clients (exclude the userData of client (my game) )

            if (payload.method === "play") { 
                
            }

        }

    }, [lastJsonMessage, sendJsonMessage, payload, oppData])

    return (
        <>
            <div className='playerContainer'>
                <div className='playerLeft'>
                    {/* EachPlayer implements canva and user details */}
                    <p>My data:</p>
                    <EachPlayer game={game} userData={userData} canEdit={true}/>
                </div>
                <div className='playerRight'>
                    <p>Opponent data:</p>
                    <EachPlayer game={game} userData={oppData} canEdit={false}/>
                    <button id = "nextOpp" onClick={() => changeOpp()}>Next opponent</button>
                </div>
            </div>
        </>
    );
}

export default GamePage;