import app from './app';
import { redisClient } from './config/session.config';
import mongoose from "mongoose";

const port = process.env.API_PORT;

// creates and starts server on port 3305
app.listen(port, () => {
  console.log(`Server listens on port ${port}`);
  const connectionMongoDB =
    mongoose.connection.readyState == 2
      ? "MongoDB connected!"
      : "Connection to MongoDB failed!";
  console.log(connectionMongoDB);
  redisClient.connect().then(() => console.log('Redis connected!')).catch(console.error);
});