const { repository } = require("./repository/memes.repository")
const sounds = require('./sounds/sounds.json');

module.exports = {
  migrate: async () => {
    for (const sound of sounds) {
      await repository.store({
        memeId: sound.id,
        ...sound,
      });
    }
  }
}