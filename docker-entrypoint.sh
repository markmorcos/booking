#!/bin/bash
set -e

# Function to check if the database is ready
function database_ready() {
  bundle exec rails runner "ActiveRecord::Base.connection.execute('SELECT 1')" &>/dev/null
  return $?
}

# Wait for the database to be ready
echo "Waiting for database to be ready..."
count=0
until database_ready || [ $count -eq 30 ]; do
  echo "Database not ready yet. Retrying in 5 seconds..."
  sleep 5
  count=$((count + 1))
done

if [ $count -eq 30 ]; then
  echo "Database not available after 150 seconds. Exiting..."
  exit 1
fi

echo "Database is ready!"

# Run database migrations
echo "Running database migrations..."
bundle exec rails db:migrate

# Check if database should be seeded
if [ "${SEED_DATABASE}" = "true" ]; then
  echo "Seeding database..."
  bundle exec rails db:seed
fi

# Remove a potentially pre-existing server.pid for Rails
rm -f /app/tmp/pids/server.pid

# Execute the command passed to the script
echo "Starting application..."
exec "$@" 