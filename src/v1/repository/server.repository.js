const mongoose = require('mongoose');

const repository = {};

const serverSchema = new mongoose.Schema({
  serverId: { type: String, required: true, unique: true },
  name: { type: String, required: true, unique: true },
},{
  timestamps: true
});

const Server = mongoose.model('Server', serverSchema);

repository.store = async (server) => {
  try {
    const newServer = new Server(server);
    await newServer.save();
  } catch (error) {
    console.error('Error storing server:', error);
  }
}

repository.updateOne = async (serverId, server) => {
  try {
    await Server.updateOne({ serverId }, server);
  } catch (error) {
    console.error('Error updating server:', error);
  }
}

repository.upsert = async (server) => {
  try {
    await Server.updateOne({ serverId: server.serverId }, server, { upsert: true });
  } catch (error) {
    console.error('Error upserting server:', error);
  }
}

repository.findAll = async (query) => {
  try {
    return await Server.find(query);
  } catch (error) {
    console.error('Error finding all Server:', error);
  }
}

repository.findById = async (id) => {
  try {
    return await Server.findOne({ serverId: id });
  } catch (error) {
    console.error('Error finding Server by id:', error);
  }
}

repository.findAllPaginated = async (page = 1, limit = 25) => {
  try {
    const skip = (page - 1) * limit;
    const servers = await Server.find()
        .skip(skip)
        .limit(limit) 
        .exec();       

    return servers;
  } catch (err) {
      console.error('Error fetching paginated servers:', err);
  }
}

repository.count = async () => {
  try {
    return await Server.countDocuments();
  } catch (error) {
    console.error('Error counting servers:', error);
  }
}

module.exports = { serverRepository: repository };