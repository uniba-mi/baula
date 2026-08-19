import path from "path";
import * as dotenv from "dotenv";

const envFile = '.env.backend';
const envResult = dotenv.config({
  path: path.resolve(__dirname, "../../", "environment", envFile),
});

if (envResult.error) {
  throw new Error(`Failed to load environment file: ${envResult.error.message}`);
}

// Validate required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'ORIGIN',
  'API_PORT',
  'SESSION_SECRET',
  'MONGO_DATABASE_URL',
  'REDIS_URL',
];

const missingVars: string[] = [];
for (const varName of requiredEnvVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
}

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}. ` +
    `Please ensure your .env.backend file contains all required values.`
  );
}

// Log loaded environment
console.log(`Environment loaded: ${process.env.NODE_ENV || 'development'}`);
console.log(`API will be served on port: ${process.env.API_PORT || 3300}`);