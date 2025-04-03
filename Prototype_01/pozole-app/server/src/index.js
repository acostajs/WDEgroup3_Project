"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)()); // Enable CORS for all routes
// Use built-in express JSON parser
app.use(express_1.default.json());
// Or use body-parser for JSON (same as express.json())
// app.use(bodyParser.json());
// If you need to handle URL encoded data:
// app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', routes_1.default);
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
