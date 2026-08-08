const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'smartdelhi',
  password: 'your_password', // Apne postgres ka password yahan dalein
  port: 5432,
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database successfully.');
});

module.exports = pool;