#!/bin/bash

# Apply database migrations
echo "Apply database migrations"
npx prisma db push

# Start server
echo "Starting server"
npm start