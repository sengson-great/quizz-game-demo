#!/bin/sh
set -e

# Clear caches to prevent host paths from overriding container paths
php artisan config:clear

# Wait for MySQL to be ready (even with healthchecks, this is a good safety)
until php artisan db:monitor; do
  >&2 echo "MySQL is still unavailable - sleeping"
  sleep 1
done

echo "MySQL is up - executing commands"

# Run migrations
php artisan migrate --force

# Check if passport keys exist, if not install
if [ ! -f storage/oauth-private.key ]; then
    php artisan passport:install --force
fi

# Run the original command
exec "$@"
