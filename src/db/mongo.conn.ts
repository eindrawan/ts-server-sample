import { MongoClient } from 'mongodb';

// MongoDB connection string
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGO_DB = process.env.MONGODB_DB || 'athena';

// MongoDB client
const client = new MongoClient(MONGO_URI);

// // MongoDB connection
if (process.env.NODE_ENV !== 'test') {
  client.connect().then(() => {
    console.log('Connected to MongoDB');
  }).catch(err => console.log(err));
}

// Set Database
const db = client.db(MONGO_DB);

function exitHandler() {
  client.close();
  process.exit(0);
}

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);

export const connectDB = client.connect.bind(client);
export const closeDB = client.close.bind(client);
// Export db
export default db;