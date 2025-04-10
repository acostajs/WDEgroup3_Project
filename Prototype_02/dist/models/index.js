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
exports.connectDB = void 0;
// src/models/index.ts
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config")); // Import config to get MONGO_URI
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!config_1.default.mongoUri) {
        console.error('FATAL ERROR: MONGO_URI is not defined in environment variables.');
        process.exit(1); // Exit if DB connection string is missing
    }
    try {
        yield mongoose_1.default.connect(config_1.default.mongoUri); // Removed deprecated options
        console.log('MongoDB Connected Successfully');
    }
    catch (error) {
        console.error('MongoDB Connection Error:', error.message);
        // Exit process with failure
        process.exit(1);
    }
    // Optional: Log disconnection events
    mongoose_1.default.connection.on('disconnected', () => {
        console.log('MongoDB disconnected.');
    });
});
exports.connectDB = connectDB;
// Export models from here later after defining them
// export * from './Employee';
// export * from './Shift';
// export * from './PerformanceLog';
//# sourceMappingURL=index.js.map