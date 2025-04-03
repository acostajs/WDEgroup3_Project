import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost', // Or your MariaDB server address
  user: 'project', // Your MariaDB username
  password: 'password', // Your MariaDB password
  database: 'wedgroup3', // The database name you created
  connectionLimit: 10, // Optional: connection pool limit
};

let pool: mysql.Pool | null = null;

async function connectDB() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('Connected to MariaDB');
    return pool;
  } catch (error: any) {
    console.error('Failed to connect to MariaDB:', error);
    process.exit(1);
    return null;
  }
}

async function getPool() {
  if (!pool) {
    await connectDB();
  }
  return pool;
}

export { connectDB, getPool };