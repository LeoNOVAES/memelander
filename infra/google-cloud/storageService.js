const { Storage } = require('@google-cloud/storage');
const path = require('path');

require('dotenv').config();

const GOOGLE_PUBLIC_URL = process.env.GOOGLE_PUBLIC_URL;

const storage = new Storage({
    projectId: process.env.PROJECT_ID,
    keyFilename: path.join(__dirname, '../../google-service-account.json')
});

const bucketName = process.env.BUCKET_NAME;

const upload = async (buffer, name) => {
    try {
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(name);
      await file.save(buffer, {
          metadata: {
              contentType: 'audio/mp3'
          }
      });

      console.log(`${name} uploaded to ${bucketName}.`);
      return `${GOOGLE_PUBLIC_URL}/${name}`;
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};

module.exports = {
  upload
}