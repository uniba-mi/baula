import app from './app';
import { redisClient } from './config/session.config';
import mongoose from "mongoose";
import { connectMongo } from './database/mongo';
import { logger } from './shared/utils/logger';

const port = process.env.API_PORT || 3300;

// connect mongo directly without await
void connectMongo();

// creates and starts server
const server = app.listen(port, () => {
  logger.info(`Server listens on port ${port}`);

  redisClient.connect()
    .then(() => logger.info('Redis connected!'))
    .catch((err) => logger.error('Redis connection failed:', err));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  server.close(() => process.exit(1));
});

// Graceful shutdown on SIGTERM (Docker, Kubernetes, etc.)
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  
  server.close(async () => {
    try {
      // Close MongoDB connection
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');
      
      // Close Redis connection
      await redisClient.quit();
      logger.info('Redis connection closed.');
      
      logger.info('Server closed.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during graceful shutdown:', err);
      process.exit(1);
    }
  });
});

// Graceful shutdown on SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  
  server.close(async () => {
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');
      
      await redisClient.quit();
      logger.info('Redis connection closed.');
      
      logger.info('Server closed.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during graceful shutdown:', err);
      process.exit(1);
    }
  });
});

export default server;