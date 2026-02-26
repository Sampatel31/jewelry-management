#!/usr/bin/env sh
# restore.sh — Restore a PostgreSQL backup
# Usage: ./restore.sh backups/backup_2024-01-01_12-00-00.sql.gz
set -e

BACKUP_FILE="${1:-}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-jewelry_db}"
DB_USER="${DB_USER:-jewelry_user}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: restore.sh <backup_file.sql.gz>"
  echo ""
  echo "Available backups:"
  ls -lh "${SCRIPT_DIR}/../backups"/backup_*.sql.gz 2>/dev/null || echo "  No backups found"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "WARNING: This will restore database '$DB_NAME' from $BACKUP_FILE"
echo "All current data will be replaced. Press Ctrl+C to cancel, or Enter to continue..."
read -r _

echo "Dropping and recreating database '$DB_NAME'..."
PGPASSWORD="${DB_PASSWORD}" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d postgres \
  -c "DROP DATABASE IF EXISTS \"$DB_NAME\";"
PGPASSWORD="${DB_PASSWORD}" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d postgres \
  -c "CREATE DATABASE \"$DB_NAME\";"

echo "Restoring from $BACKUP_FILE..."
gunzip -c "$BACKUP_FILE" | PGPASSWORD="${DB_PASSWORD}" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  "$DB_NAME"

echo "Restore completed successfully."
