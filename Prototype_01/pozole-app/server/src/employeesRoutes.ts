import express, { Request, Response } from 'express';
import { getPool } from './database/db';
import { Employee, CreateEmployeeRequest } from './types';
import { RowDataPacket, ResultSetHeader } from 'mysql2'; // Import necessary types

const employeesRouter = express.Router();

employeesRouter.get('/', async (req: Request, res: Response) => {
  console.log('GET /employees route hit (employeesRoutes)');
  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT id, firstName, lastName, email, phone, hireDate FROM employees');
    res.json(rows);
  } catch (err: any) {
    console.error('Error getting employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

employeesRouter.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  console.log(`GET /employees/${id} route hit (employeesRoutes)`);
  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT id, firstName, lastName, email, phone, hireDate FROM employees WHERE id = ?', [id]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Employee not found' });
    } else {
      res.json(rows[0]);
    }
  } catch (err: any) {
    console.error('Error getting employee:', err);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

employeesRouter.post('/', async (req: Request, res: Response) => {
  console.log('POST /employees route hit (employeesRoutes)');
  const { firstName, lastName, email, phone, hireDate } = req.body as CreateEmployeeRequest;
  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    const [result] = await pool.execute<ResultSetHeader>('INSERT INTO employees (firstName, lastName, email, phone, hireDate) VALUES (?, ?, ?, ?, ?)', [firstName, lastName, email, phone, hireDate]);
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err: any) {
    console.error('Error creating employee:', err);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

employeesRouter.put('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const { firstName, lastName, email, phone, hireDate } = req.body as CreateEmployeeRequest;
  console.log(`PUT /employees/${id} route hit (employeesRoutes)`);
  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    const [result] = await pool.execute<ResultSetHeader>('UPDATE employees SET firstName = ?, lastName = ?, email = ?, phone = ?, hireDate = ? WHERE id = ?', [firstName, lastName, email, phone, hireDate, id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Employee not found' });
    } else {
      res.json({ message: 'Employee updated successfully' });
    }
  } catch (err: any) {
    console.error('Error updating employee:', err);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

employeesRouter.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  console.log(`DELETE /employees/${id} route hit (employeesRoutes)`);
  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM employees WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Employee not found' });
    } else {
      res.json({ message: 'Employee deleted successfully' });
    }
  } catch (err: any) {
    console.error('Error deleting employee:', err);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

export default employeesRouter;