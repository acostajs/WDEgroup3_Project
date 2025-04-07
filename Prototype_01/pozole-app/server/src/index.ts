import express, { Request, Response } from 'express'; // Import Express
import employeesRouter from './employeesRoutes'; // Import Employee routes
import schedulesRouter from './schedulesRoutes'; // Import Schedule routes
import performancesRouter from './performancesRoutes'; // Import Performance routes
import cors from 'cors'; // Import CORS middleware
import { connectDB } from './database/db'; // Import database connection function

const app = express(); // Create an Express application
const port = process.env.PORT || 3000; // Define the port

// Middleware:
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

app.get('/', (req: Request, res: Response) => {
  res.send(`
    <h1>Welcome to the Pozole App API!</h1>
    <p>This API provides access to information about employees, schedules, and performances.</p>
    <h2>Available Routes:</h2>
    <ul>
      <li><strong>/employees</strong>: Endpoints for managing employee data (e.g., GET all employees, POST new employee).</li>
      <li><strong>/schedules</strong>: Endpoints for managing work schedules (e.g., GET all schedules, GET schedule by ID).</li>
      <li><strong>/performances</strong>: Endpoints for managing employee performance records (e.g., GET all performances, POST new performance review).</li>
    </ul>
    <p>Please refer to the API documentation for specific request methods (GET, POST, PUT, DELETE) and expected data formats for each route.</p>
  `);
});

// Function to start the server:
async function startServer() {
  try {
    // Connect to the database:
    await connectDB();

    // Set up routes:
    app.use('/employees', employeesRouter); // Use employee routes
    app.use('/schedules', schedulesRouter); // Use schedule routes
    app.use('/performances', performancesRouter); // Use performance routes

    // Start the server:
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  } catch (error) {
    // Handle database connection errors:
    console.error('Failed to start server due to database connection error:', error);
  }
}

// Start the server:
startServer();