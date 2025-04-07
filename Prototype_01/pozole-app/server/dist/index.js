"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Import Express
const employeesRoutes_1 = __importDefault(require("./employeesRoutes")); // Import Employee routes
const schedulesRoutes_1 = __importDefault(require("./schedulesRoutes")); // Import Schedule routes
const performancesRoutes_1 = __importDefault(require("./performancesRoutes")); // Import Performance routes
const cors_1 = __importDefault(require("cors")); // Import CORS middleware
const db_1 = require("./database/db"); // Import database connection function
const app = (0, express_1.default)(); // Create an Express application
const port = process.env.PORT || 3000; // Define the port
// Middleware:
app.use((0, cors_1.default)()); // Enable CORS
app.use(express_1.default.json()); // Parse JSON request bodies
app.get('/', (req, res) => {
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
function startServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to the database:
            yield (0, db_1.connectDB)();
            // Set up routes:
            app.use('/employees', employeesRoutes_1.default); // Use employee routes
            app.use('/schedules', schedulesRoutes_1.default); // Use schedule routes
            app.use('/performances', performancesRoutes_1.default); // Use performance routes
            // Start the server:
            app.listen(port, () => {
                console.log(`Server listening at http://localhost:${port}`);
            });
        }
        catch (error) {
            // Handle database connection errors:
            console.error('Failed to start server due to database connection error:', error);
        }
    });
}
// Start the server:
startServer();
