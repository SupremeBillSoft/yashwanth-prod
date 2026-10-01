#!/bin/bash
set -o errexit  # Exit on error
set -o pipefail # Exit if any command in a pipeline fails
set -o nounset  # Treat unset variables as errors

echo "=== Applying migrations ==="
python manage.py migrate --noinput

echo "=== Collecting static files ==="
python manage.py collectstatic --noinput

echo "=== Starting Gunicorn server ==="
exec gunicorn backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --timeout 60 \
    --log-level info \
    --access-logfile -
