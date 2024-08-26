const EachPlayer = ({ game, userData }) => {

    return (
        <div>
            <p> GameId: {game.id} </p>
            <p> ClientId: {userData.clientId} </p>
        </div>
    );
}

export default EachPlayer;