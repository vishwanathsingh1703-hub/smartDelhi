require('dotenv').config();
const app = require('./app');
const { pool } = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('Database connection verified successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 SmartDELHI Enterprise Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (error) {
    console.error("Failed to start server due to database connection error:", error);
    process.exit(1);
  }
};

startServer();