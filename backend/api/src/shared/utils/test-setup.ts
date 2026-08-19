import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connection } from '../../database/mongo';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Start in-memory MongoDB server for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Override MongoDB connection for tests
  process.env.MONGO_DATABASE_URL = mongoUri;
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    maxPoolSize: 10,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  });
});

afterAll(async () => {
  // Disconnect and stop the in-memory server
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear all test data after each test
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Mock for Redis in tests
jest.mock('../../config/session.config', () => ({
  redisClient: {
    connect: jest.fn().mockResolvedValue(true),
    quit: jest.fn().mockResolvedValue(true),
    status: 'ready',
  },
  expressSession: jest.fn(),
}));

export {};
