#!/bin/bash

# Migration Script for MathVN Backend
# This script helps run database migrations

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 MathVN Database Migration Tool"
echo "=================================="
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Loaded .env file"
else
    echo "⚠️  No .env file found, using defaults"
fi

# Set default values
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-123456}
DB_NAME=${DB_NAME:-mathvn_db}
DB_SSLMODE=${DB_SSLMODE:-disable}

# Build connection string
DB_URL="postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=${DB_SSLMODE}"

echo "📊 Database Configuration:"
echo "   Host: ${DB_HOST}"
echo "   Port: ${DB_PORT}"
echo "   User: ${DB_USER}"
echo "   Database: ${DB_NAME}"
echo ""

# Check if database exists
echo "🔍 Checking if database exists..."
if psql -U ${DB_USER} -h ${DB_HOST} -lqt | cut -d \| -f 1 | grep -qw ${DB_NAME}; then
    echo "✅ Database '${DB_NAME}' exists"
else
    echo "❌ Database '${DB_NAME}' does not exist"
    read -p "Do you want to create it? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        psql -U ${DB_USER} -h ${DB_HOST} -c "CREATE DATABASE ${DB_NAME};"
        echo "✅ Database created successfully"
    else
        echo "❌ Cannot proceed without database. Exiting."
        exit 1
    fi
fi

echo ""
echo "Select migration action:"
echo "1) Run all migrations (up)"
echo "2) Rollback last migration (down 1)"
echo "3) Rollback all migrations (down)"
echo "4) Check current version"
echo "5) Force version (expert only)"
echo "6) Exit"
echo ""

read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        echo "🔄 Running migrations UP..."
        migrate -database "${DB_URL}" -path migrations up
        echo "✅ Migrations completed"
        ;;
    2)
        echo "🔄 Rolling back last migration..."
        migrate -database "${DB_URL}" -path migrations down 1
        echo "✅ Rollback completed"
        ;;
    3)
        echo "⚠️  WARNING: This will rollback ALL migrations!"
        read -p "Are you sure? (yes/no) " -r
        if [[ $REPLY == "yes" ]]; then
            migrate -database "${DB_URL}" -path migrations down
            echo "✅ All migrations rolled back"
        else
            echo "❌ Cancelled"
        fi
        ;;
    4)
        echo "📌 Current migration version:"
        migrate -database "${DB_URL}" -path migrations version
        ;;
    5)
        read -p "Enter version to force (e.g., 2): " version
        migrate -database "${DB_URL}" -path migrations force ${version}
        echo "✅ Version forced to ${version}"
        ;;
    6)
        echo "👋 Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Done!"
