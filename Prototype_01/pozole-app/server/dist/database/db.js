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
exports.connectDB = connectDB;
exports.getPool = getPool;
const promise_1 = __importDefault(require("mysql2/promise"));
const dbConfig = {
    host: 'localhost',
    user: 'project', // MariaDB username
    password: 'password', // MariaDB password
    database: 'wedgroup3', // The database name
    connectionLimit: 10, // connection pool limit
};
let pool = null;
function connectDB() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            pool = promise_1.default.createPool(dbConfig);
            console.log('Connected to MariaDB');
            return pool;
        }
        catch (error) {
            console.error('Failed to connect to MariaDB:', error);
            process.exit(1);
            return null;
        }
    });
}
function getPool() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!pool) {
            yield connectDB();
        }
        return pool;
    });
}
