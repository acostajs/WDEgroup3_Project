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
// src/index.ts
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const models_1 = require("./models"); // Import the DB connection function
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to Database FIRST
        yield (0, models_1.connectDB)();
        // Start Express server AFTER successful DB connection
        app_1.default.listen(config_1.default.port, () => {
            console.log(`Server listening on port ${config_1.default.port}`);
            console.log(`Access local app at: http://localhost:${config_1.default.port}`);
        });
    }
    catch (error) {
        console.error('Error during server startup:', error.message);
        process.exit(1); // Exit if essential startup steps fail
    }
});
startServer();
//# sourceMappingURL=index.js.map