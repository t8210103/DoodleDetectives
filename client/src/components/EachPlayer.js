import React from 'react';
import Canvas from './Canvas';

// implements canvas and user details
const EachPlayer = ({ game, userData, canEdit }) => {

    return (
        <div>
            {/* <p> GameId: {game.id} </p> */}
            <p> Draw: {game.toDraw} </p>
            {/* <p> ClientId: {userData.clientId} </p> */}
            <p> Drawing of: {userData.name} </p>
            <Canvas canEdit={ canEdit } game={ game } userData={ userData } />
        </div>
    );
}

export default EachPlayer;