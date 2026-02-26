#!/usr/bin/env sh
# backup.sh — Create a compressed PostgreSQL backup
set -e

BACKUP_DIR="${BACKUP_DIR:-/backups}"
PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-jewelry_user}"
PGDATABASE="${PGDATABASE:-jewelry_db}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_${TIMESTAMP}.sql.gz"

echo "Starting backup to $BACKUP_FILE..."
PGPASSWORD="${PGPASSWORD}" pg_dump \
  -h "$PGHOST" \
  -p "$PGPORT" \
  -U "$PGUSER" \
  "$PGDATABASE" | gzip > "$BACKUP_FILE"

echo "Backup completed: $BACKUP_FILE ($(du -sh "$BACKUP_FILE" | cut -f1))"

# Remove backups older than RETENTION_DAYS
find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +"$RETENTION_DAYS" -delete
echo "Old backups cleaned up (retention: ${RETENTION_DAYS} days)"
