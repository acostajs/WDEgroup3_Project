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
const express_1 = __importDefault(require("express"));
const db_1 = require("./database/db");
const performancesRouter = express_1.default.Router();
performancesRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('GET /performances route hit (performancesRoutes) with query:', req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { employeeId, performanceDate } = req.query;
    let whereClauses = [];
    const queryParams = [];
    if (employeeId) {
        whereClauses.push('employeeId = ?');
        queryParams.push(parseInt(employeeId));
    }
    if (performanceDate) {
        whereClauses.push('performanceDate = ?');
        queryParams.push(performanceDate);
    }
    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const limitOffsetString = 'LIMIT ? OFFSET ?';
    try {
        const pool = yield (0, db_1.getPool)();
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        // Fetch paginated and filtered performances
        const [rows] = yield pool.execute(`SELECT id, employeeId, performanceDate, performanceRating, performanceComment FROM performances ${whereString} ORDER BY performanceDate DESC ${limitOffsetString}`, [...queryParams, limit, offset]);
        // Fetch total count of performances based on filters
        const [countRows] = yield pool.execute(`SELECT COUNT(*) as total FROM performances ${whereString}`, queryParams);
        const total = ((_a = countRows[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        res.json({ performances: rows, total });
    }
    catch (err) {
        console.error('Error getting performances:', err);
        res.status(500).json({ error: 'Failed to fetch performances' });
    }
}));
performancesRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    console.log(`GET /performances/${id} route hit (performancesRoutes)`);
    try {
        const pool = yield (0, db_1.getPool)();
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        const [rows] = yield pool.execute('SELECT id, employeeId, performanceDate, performanceRating, performanceComment FROM performances WHERE id = ?', [id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Performance not found' });
        }
        else {
            res.json(rows[0]);
        }
    }
    catch (err) {
        console.error('Error getting performance:', err);
        res.status(500).json({ error: 'Failed to fetch performance' });
    }
}));
performancesRouter.post('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('POST /performances route hit (performancesRoutes)');
    const { employeeId, performanceDate, performanceRating, performanceComment } = req.body;
    if (!performanceDate) {
        return res.status(400).json({ error: 'Performance date is required.' });
    }
    try {
        const pool = yield (0, db_1.getPool)();
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        const [employeeRows] = yield pool.execute('SELECT id FROM employees WHERE id = ?', [employeeId]);
        if (employeeRows.length === 0) {
            return res.status(400).json({ error: 'Invalid employeeId. Employee does not exist.' });
        }
        const [result] = yield pool.execute('INSERT INTO performances (employeeId, performanceDate, performanceRating, performanceComment) VALUES (?, ?, ?, ?)', [employeeId, performanceDate, performanceRating, performanceComment]);
        res.status(201).json(Object.assign({ id: result.insertId }, req.body));
    }
    catch (err) {
        console.error('Error creating performance:', err);
        next(err);
    }
}));
performancesRouter.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { employeeId, performanceDate, performanceRating, performanceComment } = req.body;
    console.log(`PUT /performances/${id} route hit (performancesRoutes)`);
    try {
        const pool = yield (0, db_1.getPool)();
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        const [result] = yield pool.execute('UPDATE performances SET employeeId = ?, performanceDate = ?, performanceRating = ?, performanceComment = ? WHERE id = ?', [employeeId, performanceDate, performanceRating, performanceComment, id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Performance not found' });
        }
        else {
            res.json({ message: 'Performance updated successfully' });
        }
    }
    catch (err) {
        console.error('Error updating performance:', err);
        res.status(500).json({ error: 'Failed to update performance' });
    }
}));
performancesRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    console.log(`DELETE /performances/${id} route hit (performancesRoutes)`);
    try {
        const pool = yield (0, db_1.getPool)();
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        const [result] = yield pool.execute('DELETE FROM performances WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Performance not found' });
        }
        else {
            res.json({ message: 'Performance deleted successfully' });
        }
    }
    catch (err) {
        console.error('Error deleting performance:', err);
        res.status(500).json({ error: 'Failed to delete performance' });
    }
}));
// Error handling middleware
performancesRouter.use((err, req, res, next) => {
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        res.status(400).json({ error: 'Invalid employeeId. Employee does not exist.' });
    }
    else {
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});
exports.default = performancesRouter;
