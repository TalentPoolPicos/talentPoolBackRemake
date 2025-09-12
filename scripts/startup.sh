#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting deployment process..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

echo "🔍 Checking database connection..."

# Wait for database to be ready with timeout
echo "⏳ Waiting for database to be ready..."
timeout=60
counter=0

until pg_isready -h postgres -p 5432 -U postgres > /dev/null 2>&1; do
    if [ $counter -ge $timeout ]; then
        echo "❌ ERROR: Database connection timeout after ${timeout} seconds"
        exit 1
    fi
    echo "Database is not ready yet. Waiting 2 seconds... (${counter}/${timeout})"
    sleep 2
    counter=$((counter + 2))
done

echo "✅ Database connection established"

# Run Prisma migrations
echo "🔄 Running database migrations..."
if npx prisma migrate deploy; then
    echo "✅ Database migrations completed successfully"
else
    echo "❌ ERROR: Database migrations failed"
    exit 1
fi

# Generate Prisma Client (in case it's needed in production)
echo "🔧 Ensuring Prisma client is available..."
if npx prisma generate; then
    echo "✅ Prisma client ready"
else
    echo "❌ ERROR: Failed to generate Prisma client"
    exit 1
fi

# Optional: Run database seeding only if ENABLE_SEEDING is set
if [ "$ENABLE_SEEDING" = "true" ]; then
    echo "🌱 Running database seeding..."
    if npx prisma db seed; then
        echo "✅ Database seeding completed"
    else
        echo "⚠️ WARNING: Database seeding failed (continuing anyway)"
    fi
fi

# Start the application
echo "🚀 Starting the application..."
exec "$@"