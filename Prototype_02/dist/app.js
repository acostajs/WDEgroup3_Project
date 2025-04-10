"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const express_session_1 = __importDefault(require("express-session"));
const connect_flash_1 = __importDefault(require("connect-flash"));
const helmet_1 = __importDefault(require("helmet"));
const errorHandler_1 = require("./middleware/errorHandler"); // We will create this
const routes_1 = __importDefault(require("./routes")); // We will create this
const app = (0, express_1.default)();
// Middleware setup:
app.use((0, morgan_1.default)('dev')); // HTTP request logging middleware
app.use(express_1.default.static(path_1.default.join(__dirname, '../public'))); // Serve static files
app.use(express_1.default.urlencoded({ extended: false })); // Parse URL-encoded request bodies
app.use(express_1.default.json()); // Parse JSON request bodies
app.use((0, helmet_1.default)()); // Security-related HTTP headers
app.use((0, express_session_1.default)({
    secret: 'your-secret-key', // Replace with a strong, random secret in a .env file
    resave: false,
    saveUninitialized: false,
}));
app.use((0, connect_flash_1.default)()); // Flash message middleware
// Template engine setup (EJS):
app.set('views', path_1.default.join(__dirname, '../views'));
app.set('view engine', 'ejs');
// Mount Routes:
app.use('/', routes_1.default); // Mounts the main and admin routes
// Error handling middleware (we'll define this later):
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map