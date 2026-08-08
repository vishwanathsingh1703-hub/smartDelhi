-- SmartDELHI Database Schema

CREATE TABLE IF NOT EXISTS wards (
    ward_id SERIAL PRIMARY KEY,
    ward_name VARCHAR(100) NOT NULL,
    zone VARCHAR(50) NOT NULL,
    total_population INT,
    new_shifts_count INT,
    total_workers INT,
    allocated_budget DECIMAL(12,2),
    required_budget DECIMAL(12,2),
    total_vehicles INT,
    vehicle_daily_run_km DECIMAL(8,2),
    recycling_rate_percentage DECIMAL(5,2),
    performance_score DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('citizen', 'worker', 'admin')) NOT NULL,
    ward_id INT REFERENCES wards(ward_id) ON DELETE SET NULL,
    phone_number VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
    complaint_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    ward_id INT REFERENCES wards(ward_id) ON DELETE CASCADE,
    category VARCHAR(50) CHECK (category IN ('garbage', 'roads', 'sewage', 'bijli', 'water', 'gas', 'aqi', 'cleanliness')) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status VARCHAR(20) CHECK (status IN ('Pending', 'In Progress', 'Resolved')) DEFAULT 'Pending',
    assigned_worker_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    public_feedback_rating INT CHECK (public_feedback_rating BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);