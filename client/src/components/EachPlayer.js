import React from 'react';
import Canvas from './Canvas';

// implements canvas and user details
const EachPlayer = ({ game, userData }) => {

    return (
        <div>
            <p> GameId: {game.id} </p>
            <p> ClientId: {userData.clientId} </p>
            <Canvas/>
        </div>
    );
}

export default EachPlayer;