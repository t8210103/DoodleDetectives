let descriptions = [];
const vision = require("@google-cloud/vision");

require('dotenv').config();

const private_key_id = process.env.private_key_id;
const private_key = process.env.private_key;
const client_email = process.env.client_email;

const credentials = {
    "private_key_id": private_key_id,
    "private_key": private_key,
    "client_email": client_email
};

const config = {
    credentials: {
        "private_key": credentials.private_key,
        "client_email": credentials.client_email
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

async function run() {

    const base64String = "iVBORw0KGgoAAAANSUhEUgAAAVEAAAGwCAYAAAAQblZlAAAAAXNSR0IArs4c6QAAIABJREFUeF7t3U2SG0d6gOECJW288RGm6RNMDLUfceUDiArPTmKEb+ADULzDLB0WtVMEmxfwhj17tmJOYOIK3loi4UGjmwRQBdTPl5n1g6dXM2J9mVlvfvWiqvKnVpU/BBBAAIHBBFaDIwUigAACCFQkKgkQQACBAAESDcATigACCJCoHEAAAQQCBEg0AE8oAgggQKJyAAEEEAgQINEAPKEIIIAAicoBBBBAIECARAPwhCKAAAIkKgcQQACBAAESDcATigACCJCoHEAAAQQCBEg0AE8oAgggQKJyAAEEEAgQINEAPKEIIIAAicoBBBBAIECARAPwhCKAAAIkKgcQQACBAAESDcATigACCJCoHEAAAQQCBEg0AE8oAgggQKJyAAEEEAgQINEAPKEIIIAAicoBBBBAIECARAPwhCKAAAIkKgcQQACBAAESDcATigACCJCoHEAAAQQCBEg0AE8oAgggQKJyAAEEEAgQINEAPKEIIIAAicoBBBBAIECARAPwhCKAAAIkKgcQQACBAAESDcATigACCJCoHEAAAQQCBEg0AE8oAgggQKJyAAEEEAgQINEAPKEIIIAAicoBBBBAIECARAPwhCKAAAIkKgcQQACBAAESDcATigACCJCoHEAAAQQCBEg0AE8oAgggQKJyAAEEEAgQINEAPKEIIIAAicoBBBBAIECARAPwhCKAAAIkKgcQQACBAAESDcATigACCJCoHEAAAQQCBEg0AE8oAgggQKJyAAEEEAgQINEAPKEIIIAAicoBBBBAIECARAPwhCKAAAIkKgcQQACBAAESDcATigACCJCoHEAAAQQCBEg0AE8oAgggQKJyAAEEEAgQINEAPKEIIIAAicoBBBBAIECARAPwhCKAAAIkKgcQQACBAAESDcATigACCJCoHEAAAQQCBEg0AE8oAgggQKJyAAEEEAgQINEAPKEIIIAAicoBBBBAIECARAPwhCKAAAIkKgcQQACBAAESDcATigACCJCoHEAAAQQCBEg0AE8oAgggQKJyAAEEEAgQINEAPKEIIIAAicoBBBBAIECARAPwhCKAAAIkKgcQQACBAAESDcATigACCJCoHEAAAQQCBEg0AE8oAgggQKJyAAEEEAgQINEAPKEI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DiCAAAIBAiQagCcUAQQQIFE5gAACCAQIkGgAnlAEEECAROUAAgggECBAogF4QhFAAAESlQMIIIBAgACJBuAJRQABBEhUDiCAAAIBAiQagCcUAQQQIFE5gAACCAQIkGgAnlAEEECAROUAAgggECBAogF4QhFAAAESlQMIIIBAgACJBuAJRQABBEhUDiCAAAIBAiRH8/qxAAABq0lEQVQagCcUAQQQIFE5gAACCAQIkGgAnlAEEECAROUAAgggECBAogF4QhFAAAESlQMIIIBAgACJBuAJRQABBEhUDiCAAAIBAiQagCcUAQQQIFE5gAACCAQIkGgAnlAEEECAROUAAgggECBAogF4QhFAAAESlQMIIIBAgACJBuAJRQABBEhUDiCAAAIBAiQagCcUAQQQIFE5gAACCAQIkGgAnlAEEECAROUAAgggECBAogF4QhFAAAESlQMIIIBAgACJBuAJRQABBEhUDiCAAAIBAiQagCcUAQQQIFE5gAACCAQIkGgAnlAEEECAROUAAgggECBAogF4QhFAAAESlQMIIIBAgACJBuAJRQABBEhUDiCAAAIBAiQagCcUAQQQIFE5gAACCAQIkGgAnlAEEECAROUAAgggECBAogF4QhFAAAESlQMIIIBAgACJBuAJRQABBEhUDiCAAAIBAiQagCcUAQQQIFE5gAACCAQIkGgAnlAEEECAROUAAgggECBAogF4QhFAAAESlQMIIIBAgACJBuAJRQABBEhUDiCAAAIBAiQagCcUAQQQ+H+RWbuwGhhf2AAAAABJRU5ErkJggg=="

    
    descriptions = await detectProperties(base64String);
    console.log('All Descriptions:', descriptions);
}

run();