-- Create database if not exists
-- This file runs automatically when the PostgreSQL container starts for the first time

-- Set timezone
SET timezone = 'UTC';

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Create initial schema will be handled by Prisma migrations

