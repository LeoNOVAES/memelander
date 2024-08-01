import mongoose, { Document } from 'mongoose';

interface ServerDocument extends Document {
  serverId: string;
  name: string;
}

const serverSchema = new mongoose.Schema<ServerDocument>({
  serverId: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
}, {
  timestamps: true,
});

const Server = mongoose.model<ServerDocument>('Server', serverSchema);


export const store = async (server: ServerDocument): Promise<void> => {
  try {
    const newServer = new Server(server);
    await newServer.save();
  } catch (error) {
    console.error('Error storing server:', error);
  }
}

export const updateOne = async (serverId: any, server: any) => {
  try {
    await Server.updateOne({ serverId }, server);
  } catch (error) {
    console.error('Error updating server:', error);
  }
}

export const upsert = async (server: any): Promise<void> => {
  try {
    await Server.updateOne({ serverId: server.serverId }, server, { upsert: true });
  } catch (error) {
    console.error('Error upserting server:', error);
  }
}

export const findAll = async (query: Record<string, unknown>): Promise<ServerDocument[]> => {
  try {
    return await Server.find(query);
  } catch (error) {
    console.error('Error finding all servers:', error);
    return [];
  }
}

export const findById = async (id: string): Promise<any> => {
  try {
    return await Server.findOne({ serverId: id });
  } catch (error) {
    console.error('Error finding server by ID:', error);
    return null;
  }
}

export const findAllPaginated = async (page = 1, limit = 25): Promise<ServerDocument[]> => {
  try {
    const skip = (page - 1) * limit;
    const servers = await Server.find()
      .skip(skip)
      .limit(limit)
      .exec();

    return servers;
  } catch (err) {
    console.error('Error fetching paginated servers:', err);
    return [];
  }
}

export const count = async (): Promise<number> => {
  try {
    return await Server.countDocuments();
  } catch (error) {
    console.error('Error counting servers:', error);
    return 0;
  }
}
