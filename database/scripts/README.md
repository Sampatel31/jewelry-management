# Database Scripts

Scripts for backing up and restoring the PostgreSQL database.

## Scripts

| Script | Description |
|--------|-------------|
| `backup.sh` | Create a compressed `.sql.gz` backup of the database |
| `restore.sh` | Restore from a backup file |
| `schedule_backup.sh` | Install a daily cron job that runs `backup.sh` |

## Environment Variables

All scripts respect the following environment variables (with defaults):

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `jewelry_db` | Database name |
| `DB_USER` | `jewelry_user` | Database user |
| `BACKUP_DIR` | `./backups` | Directory where backups are stored |

## Usage

### Manual backup

```bash
# Using defaults from environment / .env
bash database/scripts/backup.sh

# Override individual variables
DB_HOST=db.example.com DB_NAME=prod_jewelry bash database/scripts/backup.sh
```

Backups are written to `$BACKUP_DIR/jewelry_db_<YYYYMMDD_HHMMSS>.sql.gz`.

### Restore from backup

```bash
bash database/scripts/restore.sh /path/to/backup.sql.gz
```

### Schedule daily backups (cron)

```bash
bash database/scripts/schedule_backup.sh
```

This installs a cron entry that runs `backup.sh` every day at 02:00.  
Check installed jobs with `crontab -l`.

## Notes

- The scripts use `pg_dump` / `psql`, which must be installed and on `$PATH`.
- For Docker Compose deployments run scripts via `docker-compose exec`:
  ```bash
  docker-compose exec db bash /scripts/backup.sh
  ```
- Old backups are **not** automatically pruned; manage disk space manually or extend the script.
