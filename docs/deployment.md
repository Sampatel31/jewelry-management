# Deployment Guide

## Quick Start with Docker Compose

The easiest way to run the full stack in production.

### Prerequisites
- Docker 24+ and Docker Compose v2+

### Steps

```bash
git clone <repo-url>
cd jewelry-management
cp .env.example .env
# Edit .env with your secrets (JWT_SECRET, DB_PASSWORD, etc.)
docker-compose up -d
```

Services started:
| Service | Port |
|---------|------|
| Backend API | 5000 |
| Frontend (Next.js) | 3000 |
| PostgreSQL | 5432 |
| Redis | 6379 |

Run migrations on first deploy:
```bash
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed   # optional sample data
```

---

## Manual Setup (without Docker)

### Requirements
- Node.js 20
- PostgreSQL 15+
- Redis 7+

### Backend

```bash
cd backend
npm install
cp ../.env.example .env   # fill in values
npm run migrate
npm start
```

### Frontend

```bash
cd frontend
npm install
# set NEXT_PUBLIC_API_URL in .env.local
npm run build
npm start
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in all values.

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` |
| `PORT` | Backend port (default `5000`) |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port (default `5432`) |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | **Required** – random 64-char string |
| `JWT_REFRESH_SECRET` | **Required** – random 64-char string |
| `JWT_EXPIRES_IN` | Access token TTL (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (e.g. `7d`) |
| `REDIS_URL` | Redis connection URL |
| `CORS_ORIGIN` | Allowed frontend origin |
| `NEXT_PUBLIC_API_URL` | Full API URL visible to the browser |

Generate secure secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Nginx Reverse Proxy

Example configuration for a server at `example.com`:

```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d example.com
# Certbot auto-renews via cron; verify with:
sudo certbot renew --dry-run
```

---

## Database Backups

Automated backup scripts are in `database/scripts/`. See [`database/scripts/README.md`](../database/scripts/README.md) for usage.

Manual backup:
```bash
bash database/scripts/backup.sh
```

Schedule daily backups via cron:
```bash
bash database/scripts/schedule_backup.sh
```

---

## Health Check

```bash
curl http://localhost:5000/health
# { "status": "ok", "uptime": 123.45 }
```

---

## Updating

```bash
git pull
docker-compose build
docker-compose up -d
docker-compose exec backend npm run migrate
```
