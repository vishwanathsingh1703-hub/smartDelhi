/**
 * PostgreSQL Database Schema & Prepared Queries Reference for SmartDELHI
 * Note: Tables are pre-existing as specified. This file documents the structure
 * and provides helper query templates if required by background services.
 */

const QUERIES = {
  USERS: {
    CREATE_TABLE: `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        ward VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('Citizen', 'Worker', 'Admin')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
  WARDS: {
    CREATE_TABLE: `
      CREATE TABLE IF NOT EXISTS wards (
        id SERIAL PRIMARY KEY,
        ward_name VARCHAR(100) UNIQUE NOT NULL,
        zone VARCHAR(100) NOT NULL,
        total_complaints INT DEFAULT 0,
        resolved_complaints INT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
  COMPLAINTS: {
    CREATE_TABLE: `
      CREATE TABLE IF NOT EXISTS complaints (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        ward_id INT REFERENCES wards(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
  HISTORICAL_REPORTS: {
    CREATE_TABLE: `
      CREATE TABLE IF NOT EXISTS historical_reports (
        id SERIAL PRIMARY KEY,
        ward_id INT REFERENCES wards(id) ON DELETE CASCADE,
        metric_name VARCHAR(255) NOT NULL,
        metric_value NUMERIC NOT NULL,
        recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
};

module.exports = QUERIES;