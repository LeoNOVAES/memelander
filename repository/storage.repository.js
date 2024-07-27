const googleStorageService = require('../infra/google-cloud/storageService')

class StorageRepository {
  cloudService = null;
  
  constructor(cloudService) {
    this.cloudService = cloudService;
  }

  async add(buffer, filename) {
    return this.cloudService.upload(buffer, filename);
  }

  get() {
    return this.cloudService.get(data);
  }
}

module.exports = {
  googleStorage: new StorageRepository(googleStorageService),
}