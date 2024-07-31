import { Storage } from '@google-cloud/storage';
import path from 'path';

require('dotenv').config();

const GOOGLE_PUBLIC_URL = process.env.GOOGLE_PUBLIC_URL;

const storage = new Storage({
    projectId: process.env.PROJECT_ID,
    keyFilename: path.join(__dirname, '../../google-service-account.json'),
});

const bucketName = String(process.env.BUCKET_NAME);

export const upload = async (buffer: Buffer, name: string): Promise<string | undefined> => {
    try {
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(name);
        await file.save(buffer, {
            metadata: {
                contentType: 'audio/mp3',
            },
        });

        console.log(`${name} uploaded to ${bucketName}.`);
        return `${GOOGLE_PUBLIC_URL}/${name}`;
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};

export default {
    upload
}
