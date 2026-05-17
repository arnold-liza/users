const mysql = require('mysql2/promise');

// 1. Create a persistent connection pool instead of a single connection instance
// This allows multiple database queries to run concurrently without blocking each other.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'trainer',
  waitForConnections: true,
  connectionLimit: 10, // Maximum number of simultaneous connections to maintain
  queueLimit: 0
});

// 2. Return the pool instance directly
// The 'mysql2/promise' pool has the exact same .query() syntax as a single connection,
// meaning you don't have to change any code inside your userController.js!
async function getConnection() {
  return pool;
}

// 3. Graceful error tracking for your terminal console
pool.on('acquire', function (connection) {
  // Useful for tracking when database workers are picked up
});

pool.on('connection', function (connection) {
  console.log('🔌 Database pool established a new secure connection.');
});

module.exports = getConnection;