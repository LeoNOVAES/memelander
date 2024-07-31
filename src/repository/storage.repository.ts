import googleStorageService from '../infra/google-cloud/storageService';
const mp3Duration = require('mp3-duration')
const fetch = require('node-fetch')
const THREE_MB = 3 * 1024 * 1024;
const MAX_DURATION_SEC = 30;

class StorageRepository {
  cloudService: any;

  constructor(cloudService: any) {
    this.cloudService = cloudService;
  }

  async add(url: string, memeId: string) {
    console.log('Buscando arquivo a partir da URL:', url);
    const response = await fetch(url);

    if (!response.ok) return { success: false, content: 'Erro ao buscar o arquivo' };

    const buffer = await response.buffer();
    console.log('Tamanho do buffer:', buffer.length);
    if (buffer.length > THREE_MB) {
      console.log('Arquivo muito grande');
      return { success: false, content: 'O arquivo deve ter menos de 3 MB.' };
    }

    const duration = await mp3Duration(buffer);
    console.log(`Duração: ${duration} segundos`);

    if (duration > MAX_DURATION_SEC) {
      return { success: false, content: `O áudio deve ter menos de ${MAX_DURATION_SEC} segundos.` };
    }

    const urlFile = await this.cloudService.upload(buffer, memeId);
    return { success: true, content: urlFile };
  }

  get(data: any) {
    return this.cloudService.get(data);
  }
}

export default {
  googleStorage: new StorageRepository(googleStorageService),
};
