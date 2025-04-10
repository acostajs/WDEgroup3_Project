import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Correct path

const config = {
  port: process.env.PORT || 3000,           // Default to 3000 if PORT is not set
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/prototype_02', // Default to local MongoDB
  sendGridApiKey: process.env.SENDGRID_API_KEY,
  sendGridFromEmail: process.env.SENDGRID_FROM_EMAIL,
  // Add other environment variables here as needed
};

export default config;