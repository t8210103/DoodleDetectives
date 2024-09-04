import React, { useState, useEffect, useRef } from 'react';
import '../styles.css'
import { useWebSocketContext } from '../components/WebSocketContext.js';
import EachPlayer from '../components/EachPlayer.js';
import { useLocation, useNavigate } from 'react-router-dom';
import _ from 'lodash';


function GamePage() {
    const { sendJsonMessage, lastJsonMessage, connected } = useWebSocketContext();

    const navigate = useNavigate();
    const location = useLocation();
    const { payload } = location.state || {};
    const [userData, setUserData] = useState(payload.userData || null);
    const [game, setGame] = useState(payload.game || null);
    const oppDataList = game.clients.filter(client => client.userData.clientId !== userData.clientId); // All opponents userData list
    const iRef = useRef(0);
    const flagRef = useRef(false);
    const [oppData, setOppData] = useState(oppDataList[iRef.current].userData ||null);

    const changeOpp = () => {
        iRef.current = (iRef.current + 1) % (game.clients.length - 1);
        setOppData(oppDataList[iRef.current].userData);
    }
    
    useEffect(() => { 

        if (lastJsonMessage != null) {

            const response = lastJsonMessage;

            if (payload.method === "play") { 
                
            }

            if (response.method === "updateOppDrawing" && !_.isEqual(game, response.game)) {
                setGame(response.game);
                flagRef.current = true;
            }

        }

    }, [lastJsonMessage, game]);

    return (
        <>
            <div className='playerContainer'>
                <div className='playerLeft'>
                    {/* EachPlayer implements canva and user details */}
                    <p>My data:</p>
                    <EachPlayer game={game} userData={userData} canEdit={true}/>
                </div>
                { flagRef && (
                    <div className='playerRight'>
                        <p>Opponent data:</p>
                        <EachPlayer game={game} userData={oppData} canEdit={false}/>
                        <button id = "nextOpp" onClick={() => changeOpp()}>Next opponent</button>
                    </div>
                )}
            </div>
        </>
    );
}

export default GamePage;