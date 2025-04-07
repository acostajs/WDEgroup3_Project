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
const schedulesRouter = express_1.default.Router();
schedulesRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { employeeId, date } = req.query;
    let whereClauses = [];
    const queryParams = [];
    if (employeeId) {
        whereClauses.push('employeeId = ?');
        queryParams.push(parseInt(employeeId));
    }
    if (date) {
        whereClauses.push('date = ?');
        queryParams.push(date);
    }
    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const limitOffsetString = 'LIMIT ? OFFSET ?';
    try {
        const pool = yield (0, db_1.getPool)();
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        const countQuery = `SELECT COUNT(*) as total FROM schedules ${whereString}`;
        const [countResult] = yield pool.execute(countQuery, queryParams);
        const total = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        const totalPages = Math.ceil(total / limit);
        const selectQuery = `SELECT id, employeeId AS employeeId, DATE_FORMAT(date, '%Y-%m-%d') AS date, startTime, endTime FROM schedules ${whereString} ORDER BY date, startTime ${limitOffsetString}`;
        const [rows] = yield pool.execute(selectQuery, [...queryParams, limit, offset]);
        res.json({
            schedules: rows,
            totalPages: totalPages,
            currentPage: page,
        });
    }
    catch (err) {
        console.error('Error getting schedules:', err);
        res.status(500).json({ error: 'Failed to fetch schedules' });
    }
}));
schedulesRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const pool = yield (0, db_1.getPool)();
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        const [rows] = yield pool.execute('SELECT id, employeeId AS employeeId, date, startTime, endTime FROM schedules WHERE id = ?', [id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Schedule not found' });
        }
        else {
            res.json(rows[0]);
        }
    }
    catch (err) {
        console.error('Error getting schedule:', err);
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
}));
schedulesRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { employeeId, date, startTime, endTime } = req.body;
    if (!employeeId || !date || !startTime || !endTime) {
        return res.status(400).json({ error: 'Employee ID, date, start time, and end time are required.' });
    }
    if (!Date.parse(date) || !/^\d{2}:\d{2}(:\d{2})?$/.test(startTime) || !/^\d{2}:\d{2}(:\d{2})?$/.test(endTime)) {
        return res.status(400).json({ error: 'Invalid date or time format.' });
    }
    try {
        const pool = yield (0, db_1.getPool)();
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        const [result] = yield pool.execute('INSERT INTO schedules (employeeId, date, startTime, endTime) VALUES (?, ?, ?, ?)', [employeeId, date, startTime, endTime]);
        res.status(201).json({ id: result.insertId, employeeId, date, startTime, endTime, message: 'Schedule created successfully' });
    }
    catch (err) {
        console.error('Error creating schedule:', err);
        res.status(500).json({ error: 'Failed to create schedule' });
    }
}));
schedulesRouter.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { employeeId, date, startTime, endTime } = req.body;
    if (!employeeId || !date || !startTime || !endTime) {
        return res.status(400).json({ error: 'Employee ID, date, start time, and end time are required.' });
    }
    if (!Date.parse(date) || !/^\d{2}:\d{2}(:\d{2})?$/.test(startTime) || !/^\d{2}:\d{2}(:\d{2})?$/.test(endTime)) {
        return res.status(400).json({ error: 'Invalid date or time format.' });
    }
    try {
        const pool = yield (0, db_1.getPool)();
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        const [result] = yield pool.execute('UPDATE schedules SET employeeId = ?, date = ?, startTime = ?, endTime = ? WHERE id = ?', [employeeId, date, startTime, endTime, id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Schedule not found' });
        }
        else {
            res.json({ message: 'Schedule updated successfully' });
        }
    }
    catch (err) {
        console.error('Error updating schedule:', err);
        res.status(500).json({ error: 'Failed to update schedule' });
    }
}));
schedulesRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const pool = yield (0, db_1.getPool)();
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        const [result] = yield pool.execute('DELETE FROM schedules WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Schedule not found' });
        }
        else {
            res.json({ message: 'Schedule deleted successfully' });
        }
    }
    catch (err) {
        console.error('Error deleting schedule:', err);
        res.status(500).json({ error: 'Failed to delete schedule' });
    }
}));
exports.default = schedulesRouter;
