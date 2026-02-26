#!/usr/bin/env sh
# restore.sh — Restore a PostgreSQL backup
set -e

BACKUP_FILE="${1:-}"
PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-jewelry_user}"
PGDATABASE="${PGDATABASE:-jewelry_db}"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: restore.sh <backup_file.sql.gz>"
  echo ""
  echo "Available backups:"
  ls -lh "${BACKUP_DIR:-/backups}"/backup_*.sql.gz 2>/dev/null || echo "  No backups found"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "WARNING: This will restore database '$PGDATABASE' from $BACKUP_FILE"
echo "All current data will be replaced. Press Ctrl+C to cancel, or Enter to continue..."
read -r _

echo "Restoring from $BACKUP_FILE..."
gunzip -c "$BACKUP_FILE" | PGPASSWORD="${PGPASSWORD}" psql \
  -h "$PGHOST" \
  -p "$PGPORT" \
  -U "$PGUSER" \
  "$PGDATABASE"

echo "Restore completed successfully."
