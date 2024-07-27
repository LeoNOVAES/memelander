const fetch = require('node-fetch');
const googleStorageService = require('../infra/google-cloud/storageService')
const mp3Duration = require('mp3-duration');

const THREE_MB = 3 * 1024 * 1024;
const MAX_DURATION_SEC = 30;

class StorageRepository {
  cloudService = null;
  
  constructor(cloudService) {
    this.cloudService = cloudService;
  }

  async add(url, memeId) {
    console.log('Fetching file from url:', url );
    const response = await fetch(url);
    
    if (!response.ok) return { success: false, content: 'Error fetching file' };

    const buffer = await response.buffer();

    if (buffer.length > THREE_MB) {
      console.log('File too big');
      return { success: false, content: 'O arquivo deve ser menor que 3mb.' };
    }

    const duration = await mp3Duration(buffer);
    console.log(`Duration: ${duration} seconds`);

    if (duration > MAX_DURATION_SEC) {
      await message.reply({ content: `O audio deve ser menor que ${MAX_DURATION_SEC} segundos.`, ephemeral: true });
      await message.delete();
      return;
    }

    const urlFile = await this.cloudService.upload(buffer, memeId);
    return  { success: true, content: urlFile };
  }

  get() {
    return this.cloudService.get(data);
  }
}

module.exports = {
  googleStorage: new StorageRepository(googleStorageService),
}