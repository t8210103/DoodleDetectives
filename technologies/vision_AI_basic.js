let descriptions = [];
const vision = require("@google-cloud/vision");

const credentials = JSON.parse(JSON.stringify({
    "type": "service_account",
    "project_id": "aigame-431815",
    "private_key_id": "162f1ccb006c842c6b0f3c56c40441b9c10cfdc2",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCbBOyoHqcRIWrF\nUF1jLGnfY8alkf5waravCAnGKrgkgXkQHmYYnvUc5NNI3PvrlXBgxYafJ7Vvr6Al\nx1eJVZMZKGun8+3PHrfqnUOxLfBBddF4R7njqW2jJ2kbztgEdzY3DgZ5Ew7ELHT7\nFM/YE9yH9C0+Qk5/LBA37Vht0jiDM1V72oYmT5R0MR0d/WCN9WCZ3OZn+98cw7D9\nh5QUycm81OvfW7gc+TkfVamqD9EavtJuUfjdMBuzJXgvnucfI6fBh+zSxyFI0PjE\njoua8SK335/Hw86zq8POmPYMtOEvi34yT+yUhQ6UVQBsKEdogxHPh4mMEYidB2uE\nRAaW/pxtAgMBAAECggEAI8Bafhl3qVU+JRx4NTeYgTsnJKdLeYy67hoZ+vh+OHkd\nvRBttm7uk8fYTJ0egoIYBVF4zzrets/XzO6w6wzv3GT8kyMILPTmMLctVe8E0mwE\nL8vG/NDl5rNfo9ir7De8Kq1S49h31tlz7zYpCynleftf9dRf+ydj5Coac1WA0A0K\nWJfvii3SdLlnJM9It0dWsihC9TaFO7YeuSnSv1C1O19MhTTXwPFElK6GPYacpBV0\n6cxeHvXcFXEhhX8//byVzi+eBMLicWX7dKm7uMXYrVSTy5ek7Q0Ecow/2CkRf5ge\nIQK+hJQlY3+7v4x+EmsqVLCSE6ghsC6WEHNiZFhzsQKBgQDLpa7x5Dn9y9E8gVdo\nCE3k5k+hASjt80iw4XDsEhzeyTMx4GISPB+fQI+4r4+dk9j8QTtHDIsMoD3ldubA\nzI4FeckG4GDtdStq/YMXjjzMOWLUUXq1ILDU4+eR90ngXQ1WuCR1vT53nl15Yoln\n0Z25N7oF0a1PN8EEZdZNYgFgWQKBgQDC3vbkpkNGWS1/2FY81oMpU5XbPRUKg2uh\ngE5hvCP4RYYAexYNeJDyoaLOWWUba/c5D4lhAnu7Hl4X0l/3Jvgu7p9dp2Kd4kGm\nssr7rx2lmNz2jEEdFdkKpo8aYddF0FtRlv/VQubK3OoZteL31A2AF+kKsJKgdEkM\noVr8I726NQKBgHA5uhMrhpnKfGAvlw+JpAOEuFUt4nRfIav4UNaHlMlhb4kI8oLC\nB1snpQxOE4LvOyCoghZBX09x7ypJQBj3oTx7RME5XbD+ZRLs6hVNGUwiQ8hlro2q\nmkh33+GcuWWfYf5sNAt+YrJg33pJRxejeJvdjfIu/qctPn1B8btrSv7hAoGBAKN6\n8Z04bk/iGG2cTByVyUsuOBXI1JIRVoYSYa9UasipapWUrRd4AgHK4A5EqLGsjaZt\nBk9AChUckMtjTebF5odY4JFtDyps2a7DZ85lRnXaG+UqHKYN4hsxR/RWCIclGLcF\n+nIqwfuGAU64bESEvR6s8HBrWVcKtw3Ff9LvGQfRAoGAN15115TL+r8kXqk2gAEA\nKFZPDFUuur9PZ8Y4SxuJJNaQ5r04G6lyIr6n4JIuUdfv6Ut2+XRYWfR1WkOTE1gr\nh8Zugu528uqb3sAI1ll9FJ3bPDMzSrUZxps7UxKBgAVPZ6J89FY0hDQLGkOh0OkS\nfywgG5G7Tyj4YL00XuJ4QHI=\n-----END PRIVATE KEY-----\n",
    "client_email": "aigame@aigame-431815.iam.gserviceaccount.com",
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

async function detectProperties(filePath) {
    let descriptions = [];

    try {
        //label descriptions (probably most useful)
        var [result] = await client.labelDetection(filePath);
        descriptions = descriptions.concat(result.labelAnnotations.map(annotation => annotation.description));

        //web descriptions
        [result] = await client.webDetection(filePath);
        descriptions = descriptions.concat(result.webDetection.webEntities.map(entity => entity.description).filter(description => description));

        //landmark descriptions
        [result] = await client.landmarkDetection(filePath);
        descriptions = descriptions.concat(result.landmarkAnnotations.map(annotation => annotation.description));

    } catch (err) {
        console.error(err);
    }

    // Removing duplicates
    return [...new Set(descriptions)];
}

async function run() {
    const filePath = "C:\\Users\\iason\\wsApp\\WebSockets\\images\\albumcover.jpg";
    descriptions = await detectProperties(filePath);
    console.log('All Descriptions:', descriptions);
}

run();
