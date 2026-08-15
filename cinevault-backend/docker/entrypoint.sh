#!/bin/bash
set -e

echo "Waiting for the database..."
python -c "
import os, socket, sys, time
from urllib.parse import urlparse

database_url = os.environ.get('DATABASE_URL')
if database_url:
    parsed = urlparse(database_url)
    host, port = parsed.hostname, parsed.port or 5432
else:
    host = os.environ.get('POSTGRES_HOST', 'db')
    port = int(os.environ.get('POSTGRES_PORT', 5432))

for _ in range(30):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        s.connect((host, port))
        s.close()
        sys.exit(0)
    except OSError:
        s.close()
        time.sleep(1)
sys.exit('Database not reachable after 30s')
"
echo "Database is up."

python manage.py migrate --noinput
python manage.py collectstatic --noinput --clear || true

exec "$@"
