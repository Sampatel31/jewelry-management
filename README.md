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

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui, Radix UI, Lucide Icons |
| Charts | Recharts |
| Backend | Node.js 20, Express 4, TypeScript |
| Database | PostgreSQL 15 via Knex.js |
| Authentication | JWT (access + refresh tokens) |
| PDF Generation | PDFKit |
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

# Start all services (PostgreSQL + Backend + Frontend)
docker-compose up -d

# Wait ~30 seconds for services to start, then open:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api/health
```

**Default Credentials:**
- Email: `admin@jewelry.com`
- Password: `Admin@123`

---

## 🔧 Manual Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15+

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

## 📡 API Reference

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me` |
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
| `CORS_ORIGIN` | Allowed CORS origin | `*` |
| `NEXT_PUBLIC_API_URL` | Frontend API base URL | `http://localhost:5000/api` |

---

## 📋 Project Structure

```
jewelry-management/
├── frontend/          # Next.js 14 app
├── backend/           # Express + TypeScript API
├── database/
│   ├── migrations/    # 17 Knex migration files
│   └── seeds/         # Sample data seeds
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📜 License

MIT License — feel free to use for commercial projects.