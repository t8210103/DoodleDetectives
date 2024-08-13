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

function updateLobbyState(game, clientId) {

    const payload = {
        "method": "join",
        "clientId": clientId,
        "game": game
    }

    clients[clientId].connection.send(JSON.stringify(payload));

    setTimeout(updateLobbyState, 50)
}



function visionAI(base64String) {

    require('dotenv').config();

    const private_key_id = process.env.private_key_id;
    const private_key = process.env.private_key;

    const vision = require("@google-cloud/vision");

    const credentials = JSON.parse(JSON.stringify({
        "private_key_id": private_key_id,
        "private_key": private_key,
    }));

    const config = {
        credentials: {
            private_key: credentials.private_key,
            client_email: credentials.client_email
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
            if (result.landmarkAnnotations) {
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

    const descriptions = async () => await detectProperties(base64String);

    return descriptions;
    
}


module.exports = { visionAI, guid, updateAvailableGames, updateLobbyState };