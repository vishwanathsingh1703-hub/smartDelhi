const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const Response = require('./utils/response');

const app = express();

// Security and Utility Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);

// Root Health Check Endpoint
app.get('/health', (req, res) => {
  return Response.success(res, 'SmartDELHI Backend Service is running securely', {
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// 404 Route Handler
app.use((req, res) => {
  return Response.notFound(res, `Route ${req.originalUrl} not found on SmartDELHI Server`);
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error Stack:', err.stack);
  const message = err.message || 'Internal Server Error';
  return Response.serverError(res, message, err);
});

module.exports = app;