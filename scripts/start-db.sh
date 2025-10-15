#!/bin/bash

# Start PostgreSQL database with Docker Compose
echo "🚀 Starting PostgreSQL database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start the database
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until docker-compose exec postgres pg_isready -U postgres -d b2b_business > /dev/null 2>&1; do
    echo "Database is starting up..."
    sleep 2
done

echo "✅ PostgreSQL database is ready!"
echo "📊 Database URL: postgresql://postgres:postgres123@localhost:5433/b2b_business"
echo ""
echo "🔧 Next steps:"
echo "1. Run 'pnpm prisma:migrate' to create database tables"
echo "2. Run 'pnpm prisma:seed' to add sample data (optional)"
echo "3. Run 'pnpm dev' to start the development server"

