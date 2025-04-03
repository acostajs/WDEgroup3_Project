import express, { Request, Response } from 'express';
import employeesRouter from './employeesRoutes';
import schedulesRouter from './schedulesRoutes';
import performancesRouter from './performancesRoutes';
import cors from 'cors';
import { connectDB } from './database/db';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function startServer() {
  try {
    await connectDB();
    app.use('/employees', employeesRouter);
    app.use('/schedules', schedulesRouter);
    app.use('/performances', performancesRouter);

    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server due to database connection error:', error);
  }
}

startServer();