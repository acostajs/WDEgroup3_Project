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
const employeesRouter = express_1.default.Router();
employeesRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log('GET /employees route hit (employeesRoutes) with query:', req.query);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { id, firstName, lastName, email, sortBy, sortOrder } = req.query;
    let whereClauses = [];
    const queryParams = [];
    const orderByClauses = [];
    if (id) {
        whereClauses.push('id = ?');
        queryParams.push(parseInt(id));
    }
    if (firstName) {
        whereClauses.push('firstName LIKE ?');
        queryParams.push(`%${firstName}%`);
    }
    if (lastName) {
        whereClauses.push('lastName LIKE ?');
        queryParams.push(`%${lastName}%`);
    }
    if (email) {
        whereClauses.push('email LIKE ?');
        queryParams.push(`%${email}%`);
    }
    const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    if (sortBy) {
        const validSortColumns = ['id', 'firstName', 'lastName', 'email', 'phone', 'hireDate'];
        if (validSortColumns.includes(sortBy)) {
            const sortDirection = sortOrder && sortOrder.toString().toLowerCase() === 'desc' ? 'DESC' : 'ASC';
            orderByClauses.push(`${sortBy} ${sortDirection}`);
        }
    }
    const orderByString = orderByClauses.length > 0 ? `ORDER BY ${orderByClauses.join(', ')}` : '';
    const limitOffsetString = 'LIMIT ? OFFSET ?';
    try {
        const pool = yield (0, db_1.getPool)();
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        const countQuery = `SELECT COUNT(*) as total FROM employees ${whereString}`;
        const [countResult] = yield pool.execute(countQuery, queryParams);
        const total = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
        const totalPages = Math.ceil(total / limit);
        const selectQuery = `SELECT id, firstName, lastName, email, phone, hireDate FROM employees ${whereString} ${orderByString} ${limitOffsetString}`;
        const [rows] = yield pool.execute(selectQuery, [...queryParams, limit, offset]);
        res.json({
            employees: rows,
            totalPages: totalPages,
            currentPage: page,
        });
    }
    catch (err) {
        console.error('Error getting employees:', err);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
}));
employeesRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    console.log(`GET /employees/${id} route hit (employeesRoutes)`);
    try {
        const pool = yield (0, db_1.getPool)();
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        const [rows] = yield pool.execute('SELECT id, firstName, lastName, email, phone, hireDate FROM employees WHERE id = ?', [id]);
        if (rows.length === 0) {
            res.status(404).json({ error: 'Employee not found' });
        }
        else {
            res.json(rows[0]);
        }
    }
    catch (err) {
        console.error('Error getting employee:', err);
        res.status(500).json({ error: 'Failed to fetch employee' });
    }
}));
employeesRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('POST /employees route hit (employeesRoutes)');
    const { firstName, lastName, email, phone, hireDate } = req.body;
    if (!firstName || !lastName || !email || !phone || !hireDate) {
        return res.status(400).json({ error: 'First name, last name, email, phone, and hire date are required.' });
    }
    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }
    // Phone Validation (Basic example, adjust as needed)
    const phoneRegex = /^\d{10}$/; // 10-digit phone number
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Invalid phone number format.' });
    }
    // Hire Date Validation (Basic example, adjust as needed)
    if (!Date.parse(hireDate)) {
        return res.status(400).json({ error: 'Invalid hire date format.' });
    }
    try {
        const pool = yield (0, db_1.getPool)();
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        const [result] = yield pool.execute('INSERT INTO employees (firstName, lastName, email, phone, hireDate) VALUES (?, ?, ?, ?, ?)', [firstName, lastName, email, phone, hireDate]);
        res.status(201).json(Object.assign({ id: result.insertId }, req.body));
    }
    catch (err) {
        console.error('Error creating employee:', err);
        res.status(500).json({ error: 'Failed to create employee' });
    }
}));
employeesRouter.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const { firstName, lastName, email, phone, hireDate } = req.body;
    if (!firstName || !lastName || !email || !phone || !hireDate) {
        return res.status(400).json({ error: 'First name, last name, email, phone, and hire date are required.' });
    }
    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }
    // Phone Validation (Basic example, adjust as needed)
    const phoneRegex = /^\d{10}$/; // 10-digit phone number
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Invalid phone number format.' });
    }
    // Hire Date Validation (Basic example, adjust as needed)
    if (!Date.parse(hireDate)) {
        return res.status(400).json({ error: 'Invalid hire date format.' });
    }
    console.log(`PUT /employees/${id} route hit (employeesRoutes)`);
    try {
        const pool = yield (0, db_1.getPool)();
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        const [result] = yield pool.execute('UPDATE employees SET firstName = ?, lastName = ?, email = ?, phone = ?, hireDate = ? WHERE id = ?', [firstName, lastName, email, phone, hireDate, id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Employee not found' });
        }
        else {
            res.json({ message: 'Employee updated successfully' });
        }
    }
    catch (err) {
        console.error('Error updating employee:', err);
        res.status(500).json({ error: 'Failed to update employee' });
    }
}));
employeesRouter.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    console.log(`DELETE /employees/${id} route hit (employeesRoutes)`);
    try {
        const pool = yield (0, db_1.getPool)();
        if (!pool) {
            return res.status(500).json({ error: 'Database connection failed' });
        }
        const [result] = yield pool.execute('DELETE FROM employees WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Employee not found' });
        }
        else {
            res.json({ message: 'Employee deleted successfully' });
        }
    }
    catch (err) {
        console.error('Error deleting employee:', err);
        res.status(500).json({ error: 'Failed to delete employee' });
    }
}));
exports.default = employeesRouter;
