let descriptions = [];
const vision = require("@google-cloud/vision");

require('dotenv').config();

const private_key_id = process.env.private_key_id;
const private_key = process.env.private_key;
const client_email = process.env.client_email;


const credentials = JSON.parse(JSON.stringify({
    "type": "service_account",
    "project_id": "aigame-431815",
    "private_key_id": private_key_id,
    "private_key": private_key,
    "client_email": client_email,
    "client_id": "116445352685288644007",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/aigame%40aigame-431815.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
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

async function run() {
    const filePath = "C:\\Users\\iason\\wsApp\\WebSockets\\images\\albumcover.jpg";
    // Read the file
    const fs = require('fs');
    const imageBuffer = fs.readFileSync(filePath);
    // Convert to Base64
    const base64String = imageBuffer.toString('base64');
    descriptions = await detectProperties(base64String);
    console.log('All Descriptions:', descriptions);
}

run();
