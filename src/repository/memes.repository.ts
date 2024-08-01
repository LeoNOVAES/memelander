
import mongoose, { Document } from 'mongoose';
import { relative } from 'path';

export interface MemeDocument extends Document {
  memeId: string;
  name: string;
  emoji?: string;
  url: string;
  creator: string
  volume: number;
  servers?: any
}

const userSchema = new mongoose.Schema<MemeDocument>({
  memeId: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  emoji: { type: String },
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
  timestamps: true,
});

const Meme = mongoose.model<MemeDocument>('Meme', userSchema);

export const store = async (meme: any): Promise<any> => {
  try {
    const newMeme = new Meme(meme);
    return await newMeme.save();
  } catch (error) {
    console.error('Error storing meme:', error);
  }
}

export const upsert = async (meme: any): Promise<any> => {
  try {
    await Meme.updateOne({ memeId: meme.memeId }, meme, { upsert: true });
  } catch (error) {
    console.error('Error upserting meme:', error);
  }
}

export const findAll = async (query: Record<string, unknown>): Promise<any> => {
  try {
    return await Meme.find(query);
  } catch (error) {
    console.error('Error finding all memes:', error);
    return [];
  }
}

export const findById = async (id: string): Promise<any | null> => {
  try {
    return await Meme.findOne({ memeId: id });
  } catch (error) {
    console.error('Error finding meme by ID:', error);
    return null;
  }
}

export const findAllPaginated = async (query: any, page = 1, limit = 25): Promise<any[]> => {
  try {
    const skip = (page - 1) * limit;
    const memes = await Meme.find(query)
      .skip(skip)
      .limit(limit)
      .populate('servers')
      .exec();

    return memes;
  } catch (err) {
    console.error('Error fetching paginated memes:', err);
    return [];
  }
}

export const count = async (query: any): Promise<number> => {
  try {
    return await Meme.countDocuments(query);
  } catch (error) {
    console.error('Error counting memes:', error);
    return 0;
  }
}

export const addServerToMeme = async (memeId: any, serverId: any) => {
  try {
    await Meme.findOneAndUpdate({ memeId }, {
      $addToSet: { servers: serverId }
    });
  } catch (error) {
    console.error('Error to add meme into server:', error);
  }
}
export const random = async (size: number): Promise<any[]> => {
  return await Meme.aggregate([{ $sample: { size } }]);
}

