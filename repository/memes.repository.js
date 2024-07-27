const mongoose = require('mongoose');

const repository = {};

const userSchema = new mongoose.Schema({
  memeId: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  emoji: { type: String, required: false } ,
  url: { type: String, required: true, unique: true }
},{
  timestamps: true
});

const Meme = mongoose.model('Meme', userSchema);

repository.store = async (meme) => {
  try {
    const newMeme = new Meme(meme);
    await newMeme.save();
  } catch (error) {
    console.error('Error storing meme:', error);
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

repository.findAllPaginated = async (page = 1, limit = 25) => {
  try {
    const skip = (page - 1) * limit;
    const memes = await Meme.find()
        .skip(skip)
        .limit(limit) 
        .exec();       

    return memes;
  } catch (err) {
      console.error('Error fetching paginated users:', err);
  }
}

repository.count = async () => {
  try {
    return await Meme.countDocuments();
  } catch (error) {
    console.error('Error counting memes:', error);
  }
}

repository.or = (...params) => {
  return { $or: params };
}


module.exports = { repository };