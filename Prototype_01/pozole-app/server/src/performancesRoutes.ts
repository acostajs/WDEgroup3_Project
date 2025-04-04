import express, { Request, Response, NextFunction } from 'express';
import { getPool } from './database/db';
import { Performance, CreatePerformanceRequest } from './types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const performancesRouter = express.Router();

performancesRouter.get('/', async (req: Request, res: Response) => {
  console.log('GET /performances route hit (performancesRoutes)');

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    // Fetch paginated performances
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, employeeId, performanceDate, performanceRating, performanceComment FROM performances LIMIT ? OFFSET ?',
      [limit, offset]
    );

    // Fetch total count of performances
    const [countRows] = await pool.execute<RowDataPacket[]>('SELECT COUNT(*) as total FROM performances');
    const total = countRows[0].total;

    console.log('Total Records:', total); // Debugging: Check the total count

    res.json({ performances: rows as Performance[], total });
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

performancesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  console.log('POST /performances route hit (performancesRoutes)');
  const { employeeId, performanceDate, performanceRating, performanceComment } = req.body as CreatePerformanceRequest;

  if (!performanceDate) {
    return res.status(400).json({ error: 'Performance date is required.' });
  }

  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    // Check if the employeeId exists
    const [employeeRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM employees WHERE id = ?',
      [employeeId]
    );

    if (employeeRows.length === 0) {
      return res.status(400).json({ error: 'Invalid employeeId. Employee does not exist.' });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO performances (employeeId, performanceDate, performanceRating, performanceComment) VALUES (?, ?, ?, ?)',
      [employeeId, performanceDate, performanceRating, performanceComment]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err: any) {
    console.error('Error creating performance:', err);
    next(err); // Pass the error to the error handling middleware
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

// Error handling middleware
performancesRouter.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    res.status(400).json({ error: 'Invalid employeeId. Employee does not exist.' });
  } else {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

export default performancesRouter;