function visionAI(base64String) {
    return null;
} 

//Generates unique id for users --> alternatively i can take the id from the connection
function guid() {

    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
    }

    guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();

    return guid()
}

function updateAvailableGames(games, clientId, clients) {

    const payload = {
        "method": "allGames",
        "clientId": clientId,
        "games": games
    }



    for (const clientId in clients) {
        clients[clientId].connection.send(JSON.stringify(payload));
    }

    setTimeout(updateAvailableGames, 50)
}

module.exports = { visionAI, guid, updateAvailableGames };