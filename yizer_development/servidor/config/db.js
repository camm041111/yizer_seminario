// config/db.js
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '172.17.0.2',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1920',
  database: process.env.DB_NAME || 'yizer_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Exportamos la promesa para usar async/await
module.exports = pool.promise();