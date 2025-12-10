-- Initialize PostgreSQL database for Collector.shop
-- This script runs automatically when the PostgreSQL container is first created

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a test user for development (password: Test123!@#)
-- This is just for reference, actual users should be created through the API

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE collector TO collector;
