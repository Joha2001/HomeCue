#!/bin/bash

echo "📦 Setting up database..."

# Run database schema migrations
npx drizzle-kit push:pg

# Run initialization script
npx tsx scripts/init-db.ts

echo "✅ Database setup complete!"