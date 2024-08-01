import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const url = String(process.env.MONGODB_URL);

async function connect(): Promise<void> {
    try {
        await mongoose.connect(url);
        console.log('Connected successfully to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        throw err;
    }
}

async function close(): Promise<void> {
    try {
        await mongoose.disconnect();
        console.log('MongoDB connection closed');
    } catch (err) {
        console.error('Error closing MongoDB connection', err);
    }
}

export { connect, close };