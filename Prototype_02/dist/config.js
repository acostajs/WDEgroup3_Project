"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') }); // Load from the root .env
const config = {
    port: process.env.PORT || 3000, // Default to 3000 if PORT is not set
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/prototype_02', // Default to local MongoDB
    sendGridApiKey: process.env.SENDGRID_API_KEY,
    sendGridFromEmail: process.env.SENDGRID_FROM_EMAIL,
    // Add other environment variables here as needed
};
exports.default = config;
//# sourceMappingURL=config.js.map