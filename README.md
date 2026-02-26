# 💎 JewelMS — Jewelry Management System

![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)

A **production-ready, full-stack Jewelry Management System** built for real-world jewelry businesses. Manage inventory, billing, POS, customers, suppliers, production, repairs, and reports — all in one platform.

---

## ✨ Features

- 🔐 **Authentication** — JWT-based login with role-based access control (Admin, Manager, Staff, Accountant)
- 📦 **Inventory Management** — Full product CRUD with categories, barcode support, low-stock alerts
- 🏭 **Production** — Kanban board for production jobs, Bill of Materials (BOM) editor
- 🧾 **Billing & Invoicing** — GST-compliant invoices with PDF generation, payment tracking
- 🖥️ **POS (Point of Sale)** — Fast POS interface with barcode search, cash/card/UPI payment, change calculator
- 👥 **Customer Management** — Customer profiles with purchase history, loyalty points, birthday reminders
- 🛒 **Supplier & Purchases** — Purchase orders with goods receiving workflow
- 🔧 **Repairs** — Repair job cards with status tracking
- 📊 **Reports & Analytics** — Sales trends, inventory valuation, top products, GST reports
- ⚙️ **Settings** — Store configuration, tax rates, daily metal rates, user management
- 💎 **AI Copilot** — Read-only AI assistant for inventory, sales, and operations queries

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui, Radix UI, Lucide Icons |
| Charts | Recharts |
| Backend | Node.js 20, Express 4, TypeScript |
| Database | PostgreSQL 15 via Knex.js |
| Caching | Redis 7 via ioredis (graceful degradation) |
| Authentication | JWT (access 15m + DB-backed rotating refresh 7d) |
| PDF Generation | PDFKit |
| Logging | Winston + Daily Rotate File |
| Metrics | Prometheus (prom-client) |
| Containerization | Docker, Docker Compose |

---

## 📸 Screenshots

> Running on `http://localhost:3000` after `docker-compose up -d`

| Dashboard | POS | Inventory |
|-----------|-----|-----------|
| KPI cards + charts | Full-screen sale flow | Product list with filters |

---

## 🚀 Quick Start (Docker)

```bash
# Clone the repo
git clone https://github.com/Sampatel31/jewelry-management.git
cd jewelry-management

# Start all services (PostgreSQL + Redis + Backend + Frontend)
docker-compose up -d

# Wait ~30 seconds for services to start, then open:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api/health
# Health Check: http://localhost:5000/health
```

**Default Credentials:**
- Email: `admin@jewelry.com`
- Password: `Admin@123`

---

## 🔧 Manual Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+ (optional — caching disabled gracefully if unavailable)

### 1. Database
```bash
# Create database
createdb jewelry_db
createuser jewelry_user
psql -c "ALTER USER jewelry_user WITH PASSWORD 'jewelry_pass';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE jewelry_db TO jewelry_user;"
```

### 2. Backend
```bash
cd backend
npm install

# Configure environment
cp ../.env.example .env
# Edit .env with your database credentials

# Run migrations and seeds
npm run migrate
npm run seed

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install

# Start development server
npm run dev
# App runs on http://localhost:3000
```

---

## 🔒 Production Hardening

### Security
- **Helmet.js** with HSTS (max-age 1 year, includeSubDomains, preload)
- **CORS** restricted to `ALLOWED_ORIGINS` env var (comma-separated)
- **HPP** (HTTP Parameter Pollution) protection
- **Rate limiting**: 500 req/15min global, 10 req/15min on login, 200 req/min on POS
- **DB-backed JWT refresh token rotation**: 15min access tokens + 7d rotating refresh tokens stored as SHA-256 hashes
- **Password strength** validation: uppercase + lowercase + number + special character required
- **Zod validation** middleware on all 13 route groups
- **Soft deletes** (`deleted_at`) on products, customers, suppliers, invoices, production_jobs, repairs
- **Invoices DELETE → 405** — invoices cannot be hard-deleted

### Observability
- **Winston** structured JSON logging with daily log rotation (`logs/` directory)
- **Request logger** middleware: method, URL, status, latency, user ID
- **Audit logs** table: all CUD operations logged with old/new values and IP address
- **`GET /health`** — DB ping, uptime, latency, degraded status (no auth required)
- **`GET /metrics`** — Prometheus format via prom-client (protected by `x-metrics-token` header)

### Resilience
- **Knex transactions** on all multi-table writes: `createInvoice`, `completeSale`, `receiveGoods`, `completeJob`
- **Retry utility** (`backend/src/utils/retry.ts`) with exponential backoff for transient DB errors
- **Redis caching** with graceful degradation if Redis is unavailable:
  - Products, categories, dashboard: 60s TTL
  - Settings, metal rates: 300s TTL
  - Cache invalidated on mutations

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| Products | `GET/POST /products`, `GET/PUT/DELETE /products/:id`, `GET /products/barcode/:barcode` |
| Categories | `GET/POST /categories`, `PUT/DELETE /categories/:id` |
| Inventory | `POST /inventory/adjust`, `GET /inventory/transactions`, `GET /inventory/low-stock` |
| Customers | `GET/POST /customers`, `GET/PUT/DELETE /customers/:id`, `GET /customers/:id/invoices` |
| Suppliers | `GET/POST /suppliers`, `GET/PUT/DELETE /suppliers/:id` |
| Purchases | `GET/POST /purchases/orders`, `GET /purchases/orders/:id`, `PUT /purchases/orders/:id/receive` |
| Billing | `GET/POST /billing/invoices`, `GET /billing/invoices/:id`, `POST /billing/invoices/:id/payment`, `GET /billing/invoices/:id/pdf` |
| POS | `POST /pos/sale`, `GET /pos/search` |
| Production | `GET/POST /production/jobs`, `PUT /production/jobs/:id/status`, `GET/POST /production/bom` |
| Repairs | `GET/POST /repairs`, `GET/PUT /repairs/:id`, `PUT /repairs/:id/status` |
| Reports | `GET /reports/dashboard`, `GET /reports/sales`, `GET /reports/gst`, `GET /reports/top-products` |
| Settings | `GET/PUT /settings`, `GET/POST /settings/metal-rates`, `GET/POST/PUT /settings/users` |
| AI | `POST /ai/chat` |
| Health | `GET /health` (no auth) |
| Metrics | `GET /metrics` (requires `x-metrics-token` header) |

---

## 🗄️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | — |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | — |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins | `*` |
| `REDIS_URL` | Redis connection URL (optional) | — |
| `METRICS_TOKEN` | Token for `/metrics` endpoint | — |
| `OPENAI_API_KEY` | OpenAI key (optional — rule-based fallback if absent) | — |
| `LOG_LEVEL` | Winston log level | `info` |
| `NEXT_PUBLIC_API_URL` | Frontend API base URL | `http://localhost:5000/api` |

---

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:5000/health
# {"status":"ok","db":"ok","uptime":123.4,"dbLatencyMs":2,"timestamp":"..."}
```

### Prometheus Metrics
```bash
curl -H "x-metrics-token: your-token" http://localhost:5000/metrics
```

Import the Prometheus metrics into Grafana for dashboards.

---

## 💾 Backup & Restore

```bash
# Create a backup manually
cd jewelry-management
PGPASSWORD=jewelry_pass ./backend/scripts/backup.sh

# Run backup via Docker Compose (one-off)
docker-compose --profile backup run --rm backup

# Restore from a backup file
PGPASSWORD=jewelry_pass ./backend/scripts/restore.sh /backups/backup_20240101_120000.sql.gz
```

Backups are stored in the `backups/` directory with 7-day retention by default.

---

## 💎 AI Assistant

The AI Copilot (💎 button, bottom-right) provides a read-only interface to query your jewelry store data using natural language.

- **Role-filtered context**: admins see revenue/user metrics; staff see only inventory summaries
- **Read-only**: the AI cannot modify any data
- **OpenAI integration**: uses `gpt-4o-mini` if `OPENAI_API_KEY` is set; falls back to rule-based responses otherwise
- **All interactions are logged** to the `ai_interaction_logs` table for auditing

---

## 📋 Project Structure

```
jewelry-management/
├── frontend/                   # Next.js 14 app
│   ├── components/
│   │   ├── ai/AICopilot.tsx    # AI Copilot chat panel
│   │   ├── ErrorBoundary.tsx   # React error boundary
│   │   └── layout/             # Dashboard layout
│   └── lib/api.ts              # Axios client with refresh rotation
├── backend/
│   ├── src/
│   │   ├── controllers/        # 14 route controllers
│   │   ├── middleware/         # Auth, RBAC, error handler, request logger
│   │   ├── routes/             # 14 route files
│   │   ├── utils/              # logger, audit, cache, retry, aiSafety, AppError
│   │   └── validators/         # Zod schemas for all routes
│   └── scripts/                # backup.sh, restore.sh
├── database/
│   ├── migrations/             # 22 Knex migration files
│   └── seeds/                  # Sample data seeds
├── docker-compose.yml          # PostgreSQL + Redis + Backend + Frontend + Backup
├── .env.example
└── README.md
```

---

## 📜 License

MIT License — feel free to use for commercial projects.