const mongoose = require('mongoose');

const repository = {};

const userSchema = new mongoose.Schema({
  memeId: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  emoji: { type: String, required: false },
  url: { type: String, required: true, unique: true },
  volume: { type: Number, default: 0.4 },
  creator: { type: String, required: false },
  servers: { 
    type: [mongoose.Schema.Types.ObjectId], 
    required: false, 
    ref: 'Server',
    default: []
  },
}, {
  timestamps: true
});

const Meme = mongoose.model('Meme', userSchema);

repository.store = async (meme) => {
  try {
    const newMeme = new Meme(meme);
    return await newMeme.save();
  } catch (error) {
    console.error('Error storing meme:', error);
  }
}

repository.upsert = async (meme) => {
  try {
    await Meme.updateOne({ memeId: meme.memeId }, meme, { upsert: true });
  } catch (error) {
    console.error('Error upserting meme:', error);
  }
}

repository.findAll = async (query) => {
  try {
    return await Meme.find(query);
  } catch (error) {
    console.error('Error finding all memes:', error);
  }
}

repository.findById = async (id) => {
  try {
    return await Meme.findOne({ memeId: id });
  } catch (error) {
    console.error('Error finding all memes:', error);
  }
}

repository.findAllPaginated = async (query, page = 1, limit = 25) => {
  try {
    const skip = (page - 1) * limit;
    const memes = await Meme.find(query)
      .skip(skip)
      .limit(limit)
      .populate('servers')
      .exec();

    return memes;
  } catch (err) {
    console.error('Error fetching paginated users:', err);
  }
}

repository.count = async (query) => {
  try {
    return await Meme.countDocuments(query);
  } catch (error) {
    console.error('Error counting memes:', error);
  }
}

repository.addServerToMeme = async (memeId, serverId) => {
  try {
    await Meme.findOneAndUpdate({ memeId }, {
      $addToSet: { servers: serverId }
    });
  } catch (error) {
    console.error('Error to add meme into server:', error);
  }
}

repository.random = async (size) => {
  return await Meme.aggregate([{ $sample: { size } }]);
}

module.exports = { memeRepository: repository };
