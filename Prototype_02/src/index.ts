// src/index.ts
import app from './app';
import config from './config';
import { connectDB } from './models'; // Import the DB connection function

const startServer = async () => {
  try {
    // Connect to Database FIRST
    await connectDB();

    // Start Express server AFTER successful DB connection
    app.listen(config.port, () => {
      console.log(`Server listening on port ${config.port}`);
      console.log(`Access local app at: http://localhost:${config.port}`);
    });
  } catch (error: any) {
    console.error('Error during server startup:', error.message);
    process.exit(1); // Exit if essential startup steps fail
  }
};

startServer();