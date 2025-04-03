import express, { Request, Response } from 'express';
import { getPool } from './database/db';
import { CreateScheduleRequest } from './types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const schedulesRouter = express.Router();

schedulesRouter.get('/', async (req: Request, res: Response) => {
  console.log('GET /schedules route hit (schedulesRoutes)');
  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, employeeId, date, startTime, endTime FROM schedules'
    );
    res.json(rows);
  } catch (err: any) {
    console.error('Error getting schedules:', err);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

schedulesRouter.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  console.log(`GET /schedules/${id} route hit (schedulesRoutes)`);
  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, employeeId, date, startTime, endTime FROM schedules WHERE id = ?',
      [id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: 'Schedule not found' });
    } else {
      res.json(rows[0]);
    }
  } catch (err: any) {
    console.error('Error getting schedule:', err);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

schedulesRouter.post('/', async (req: Request, res: Response) => {
  console.log('POST /schedules route hit (schedulesRoutes)');
  const { employeeId, date, startTime, endTime } = req.body as CreateScheduleRequest;
  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO schedules (employeeId, date, startTime, endTime) VALUES (?, ?, ?, ?)',
      [employeeId, date, startTime, endTime]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err: any) {
    console.error('Error creating schedule:', err);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

schedulesRouter.put('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const { employeeId, date, startTime, endTime } = req.body as CreateScheduleRequest;
  console.log(`PUT /schedules/${id} route hit (schedulesRoutes)`);
  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE schedules SET employeeId = ?, date = ?, startTime = ?, endTime = ? WHERE id = ?',
      [employeeId, date, startTime, endTime, id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Schedule not found' });
    } else {
      res.json({ message: 'Schedule updated successfully' });
    }
  } catch (err: any) {
    console.error('Error updating schedule:', err);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

schedulesRouter.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  console.log(`DELETE /schedules/${id} route hit (schedulesRoutes)`);
  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM schedules WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Schedule not found' });
    } else {
      res.json({ message: 'Schedule deleted successfully' });
    }
  } catch (err: any) {
    console.error('Error deleting schedule:', err);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

export default schedulesRouter;