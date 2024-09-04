import React from 'react';
import Canvas from './Canvas';

// implements canvas and user details
const EachPlayer = ({ game, userData, canEdit }) => {

    return (
        <div>
            <p> GameId: {game.id} </p>
            <p> ClientId: {userData.clientId} </p>
            <Canvas canEdit={ canEdit } game={ game } clientId={ userData.clientId } />
        </div>
    );
}

export default EachPlayer;