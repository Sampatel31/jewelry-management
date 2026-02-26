#!/usr/bin/env sh
# schedule_backup.sh — Install a daily cron job for automated backups
# Usage: ./schedule_backup.sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup.sh"
LOG_FILE="/var/log/jewelry_backup.log"

# Ensure backup script is executable
chmod +x "$BACKUP_SCRIPT"

CRON_ENTRY="0 2 * * * $BACKUP_SCRIPT >> $LOG_FILE 2>&1"

# Add to crontab if not already present
(crontab -l 2>/dev/null | grep -qF "$BACKUP_SCRIPT") && {
  echo "Cron job already installed: $CRON_ENTRY"
  exit 0
}

(crontab -l 2>/dev/null; echo "$CRON_ENTRY") | crontab -
echo "Cron job installed: $CRON_ENTRY"
echo "Backups will run daily at 2:00 AM. Logs: $LOG_FILE"
