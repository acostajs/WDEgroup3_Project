import express from 'express';
import path from 'path';
import morgan from 'morgan';
import session from 'express-session';
import flash from 'connect-flash';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler'; // We will create this
import config from './config';
import routes from './routes'; // We will create this

const app = express();

// Middleware setup:
app.use(morgan('dev'));         // HTTP request logging middleware
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded request bodies
app.use(express.json());       // Parse JSON request bodies
app.use(helmet());               // Security-related HTTP headers
app.use(session({               // Session middleware (required for flash messages)
  secret: 'your-secret-key', // Replace with a strong, random secret in a .env file
  resave: false,
  saveUninitialized: false,
}));
app.use(flash());                // Flash message middleware

// Template engine setup (EJS):
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Mount Routes:
app.use('/', routes); // Mounts the main and admin routes

// Error handling middleware (we'll define this later):
app.use(errorHandler);

export default app;