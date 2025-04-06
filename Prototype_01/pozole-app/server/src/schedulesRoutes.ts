import express, { Request, Response } from 'express';
import { getPool } from './database/db';
import { Schedule, CreateScheduleRequest } from './types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const schedulesRouter = express.Router();

schedulesRouter.get('/', async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  const { employeeId, date } = req.query;

  let whereClauses = [];
  const queryParams: any[] = [];

  if (employeeId) {
    whereClauses.push('employeeId = ?');
    queryParams.push(parseInt(employeeId as string));
  }
  if (date) {
    whereClauses.push('date = ?');
    queryParams.push(date as string);
  }

  const whereString = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const limitOffsetString = 'LIMIT ? OFFSET ?';

  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }

    const countQuery = `SELECT COUNT(*) as total FROM schedules ${whereString}`;
    const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, queryParams);
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const selectQuery = `SELECT id, employeeId AS employeeId, DATE_FORMAT(date, '%Y-%m-%d') AS date, startTime, endTime FROM schedules ${whereString} ORDER BY date, startTime ${limitOffsetString}`;
    const [rows] = await pool.execute<RowDataPacket[]>(selectQuery, [...queryParams, limit, offset]);

    res.json({
      schedules: rows,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (err: any) {
    console.error('Error getting schedules:', err);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

schedulesRouter.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    const [rows] = await pool.execute<RowDataPacket[]>('SELECT id, employeeId AS employeeId, date, startTime, endTime FROM schedules WHERE id = ?', [id]);
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
  const { employeeId, date, startTime, endTime } = req.body as CreateScheduleRequest;

  if (!employeeId || !date || !startTime || !endTime) {
    return res.status(400).json({ error: 'Employee ID, date, start time, and end time are required.' });
  }

  if (!Date.parse(date) || !/^\d{2}:\d{2}(:\d{2})?$/.test(startTime) || !/^\d{2}:\d{2}(:\d{2})?$/.test(endTime)) {
    return res.status(400).json({ error: 'Invalid date or time format.' });
  }

  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    const [result] = await pool.execute<ResultSetHeader>('INSERT INTO schedules (employeeId, date, startTime, endTime) VALUES (?, ?, ?, ?)', [employeeId, date, startTime, endTime]);
    res.status(201).json({ id: result.insertId, employeeId, date, startTime, endTime, message: 'Schedule created successfully' });
  } catch (err: any) {
    console.error('Error creating schedule:', err);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

schedulesRouter.put('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const { employeeId, date, startTime, endTime } = req.body as CreateScheduleRequest;

  if (!employeeId || !date || !startTime || !endTime) {
    return res.status(400).json({ error: 'Employee ID, date, start time, and end time are required.' });
  }

  if (!Date.parse(date) || !/^\d{2}:\d{2}(:\d{2})?$/.test(startTime) || !/^\d{2}:\d{2}(:\d{2})?$/.test(endTime)) {
    return res.status(400).json({ error: 'Invalid date or time format.' });
  }

  try {
    const pool = await getPool();
    if (!pool) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    const [result] = await pool.execute<ResultSetHeader>('UPDATE schedules SET employeeId = ?, date = ?, startTime = ?, endTime = ? WHERE id = ?', [employeeId, date, startTime, endTime, id]);
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