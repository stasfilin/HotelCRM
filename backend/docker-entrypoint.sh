#!/bin/bash

# Apply database migrations
echo "Apply database migrations"
npx prisma migrate dev --preview-feature

# Start server
echo "Starting server"
npm start