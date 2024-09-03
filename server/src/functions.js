//Generates unique id for users --> alternatively i can take the id from the connection
function guid() {

    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
    }

    guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();

    return guid()
}

function updateAvailableGames(games, clientId, clients) { //interferes with GameLobby

    const payload = {
        "method": "allGames",
        "clientId": clientId,
        "games": games
    }

    for (const clientId in clients) {
        clients[clientId].connection.send(JSON.stringify(payload));
    }
    
}

function updateLobbyState(game, clientId) { //probably doesnt work

    const payload = {
        "method": "join",
        "clientId": clientId,
        "game": game
    }

    clients[clientId].connection.send(JSON.stringify(payload));

    setTimeout(updateLobbyState, 50)
}



async function visionAI(base64String) {

    const vision = require("@google-cloud/vision");
    require('dotenv').config();

    const private_key_id = process.env.private_key_id;
    const private_key = process.env.private_key;
    const client_email = process.env.client_email;

    const config = {
        credentials: {
            "private_key": private_key,
            "private_key_id": private_key_id,
            "client_email": client_email
        }
    }

    const client = new vision.ImageAnnotatorClient(config);

    async function detectProperties(base64String) {
        let descriptions = [];
        
        try {
            const imageBuffer = Buffer.from(base64String, 'base64');
            const request = {
                image: { content: imageBuffer },
                features: [
                    { type: 'LABEL_DETECTION' },
                    { type: 'WEB_DETECTION' },
                    { type: 'LANDMARK_DETECTION' },
                    { type: 'OBJECT_LOCALIZATION' }
                ]
            };

            const [result] = await client.annotateImage(request);

            // Label descriptions (probably most useful)
            if (result.labelAnnotations) {
                descriptions = descriptions.concat(result.labelAnnotations.map(annotation => annotation.description));
            }

            // Web descriptions
            if (result.webDetection && result.webDetection.webEntities) {
                descriptions = descriptions.concat(result.webDetection.webEntities.map(entity => entity.description).filter(description => description));
            }

            // Landmark descriptions
            if (result.landmarkAnnotations) {
                descriptions = descriptions.concat(result.landmarkAnnotations.map(annotation => annotation.description));
            }

            // Object descriptions
            if (result.localizedObjectAnnotations) {
                descriptions = descriptions.concat(result.localizedObjectAnnotations.map(annotation => annotation.name));
            }
            

        } catch (err) {
            console.error(err);
        }

        // Removing duplicates
        return [...new Set(descriptions)];
    }

    /* async function run(base64String) { // image to base64String convertion
        const filePath = "C:\\Users\\iason\\wsApp\\WebSockets\\images\\albumcover.jpg";
        // Read the file
        const fs = require('fs');
        const imageBuffer = fs.readFileSync(filePath);
        // Convert to Base64
        const base64String = imageBuffer.toString('base64');
        descriptions = await detectProperties(base64String);
        return descriptions;
    } */

    descriptions = await detectProperties(base64String);

    return descriptions;
    
}


module.exports = { visionAI, guid, updateAvailableGames, updateLobbyState };