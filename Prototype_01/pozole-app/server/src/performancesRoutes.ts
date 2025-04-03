import express, { Request, Response } from 'express';
import { getPool } from './database/db';
import { Performance, CreatePerformanceRequest } from './types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const performancesRouter = express.Router();

performancesRouter.get('/', async (req: Request, res: Response) => {
  console.log('GET /performances route hit (performancesRoutes)');
  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, employeeId, performanceDate, performanceRating, performanceComment FROM performances'
    );
    res.json(rows as Performance[]);
  } catch (err: any) {
    console.error('Error getting performances:', err);
    res.status(500).json({ error: 'Failed to fetch performances' });
  }
});

performancesRouter.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  console.log(`GET /performances/${id} route hit (performancesRoutes)`);
  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, employeeId, performanceDate, performanceRating, performanceComment FROM performances WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Performance not found' });
    } else {
      res.json(rows[0] as Performance);
    }
  } catch (err: any) {
    console.error('Error getting performance:', err);
    res.status(500).json({ error: 'Failed to fetch performance' });
  }
});

performancesRouter.post('/', async (req: Request, res: Response) => {
  console.log('POST /performances route hit (performancesRoutes)');
  const { employeeId, performanceDate, performanceRating, performanceComment } = req.body as CreatePerformanceRequest;
  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO performances (employeeId, performanceDate, performanceRating, performanceComment) VALUES (?, ?, ?, ?)',
      [employeeId, performanceDate, performanceRating, performanceComment]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err: any) {
    console.error('Error creating performance:', err);
    res.status(500).json({ error: 'Failed to create performance' });
  }
});

performancesRouter.put('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const { employeeId, performanceDate, performanceRating, performanceComment } = req.body as CreatePerformanceRequest;
  console.log(`PUT /performances/${id} route hit (performancesRoutes)`);
  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE performances SET employeeId = ?, performanceDate = ?, performanceRating = ?, performanceComment = ? WHERE id = ?',
      [employeeId, performanceDate, performanceRating, performanceComment, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Performance not found' });
    } else {
      res.json({ message: 'Performance updated successfully' });
    }
  } catch (err: any) {
    console.error('Error updating performance:', err);
    res.status(500).json({ error: 'Failed to update performance' });
  }
});

performancesRouter.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  console.log(`DELETE /performances/${id} route hit (performancesRoutes)`);
  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM performances WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Performance not found' });
    } else {
      res.json({ message: 'Performance deleted successfully' });
    }
  } catch (err: any) {
    console.error('Error deleting performance:', err);
    res.status(500).json({ error: 'Failed to delete performance' });
  }
});

export default performancesRouter;