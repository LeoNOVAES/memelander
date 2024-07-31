
import mongoose, { Document } from 'mongoose';

export interface MemeDocument extends Document {
  memeId: string;
  name: string;
  emoji?: string;
  url: string;
  volume: number;
}

const userSchema = new mongoose.Schema<MemeDocument>({
  memeId: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  emoji: { type: String },
  url: { type: String, required: true, unique: true },
  volume: { type: Number, default: 0.4 },
}, {
  timestamps: true,
});

const Meme = mongoose.model<MemeDocument>('Meme', userSchema);

export const store = async (meme: MemeDocument): Promise<void> => {
  try {
    const newMeme = new Meme(meme);
    await newMeme.save();
  } catch (error) {
    console.error('Error storing meme:', error);
  }
}

export const upsert = async (meme: MemeDocument): Promise<void> => {
  try {
    await Meme.updateOne({ memeId: meme.memeId }, meme, { upsert: true });
  } catch (error) {
    console.error('Error upserting meme:', error);
  }
}

export const findAll = async (query: Record<string, unknown>): Promise<MemeDocument[]> => {
  try {
    return await Meme.find(query);
  } catch (error) {
    console.error('Error finding all memes:', error);
    return [];
  }
}

export const findById = async (id: string): Promise<MemeDocument | null> => {
  try {
    return await Meme.findOne({ memeId: id });
  } catch (error) {
    console.error('Error finding meme by ID:', error);
    return null;
  }
}

export const findAllPaginated = async (page = 1, limit = 25): Promise<MemeDocument[]> => {
  try {
    const skip = (page - 1) * limit;
    const memes = await Meme.find()
      .skip(skip)
      .limit(limit)
      .exec();

    return memes;
  } catch (err) {
    console.error('Error fetching paginated memes:', err);
    return [];
  }
}

export const count = async (): Promise<number> => {
  try {
    return await Meme.countDocuments();
  } catch (error) {
    console.error('Error counting memes:', error);
    return 0;
  }
}

export const random = async (size: number): Promise<MemeDocument[]> => {
  return await Meme.aggregate([{ $sample: { size } }]);
}
