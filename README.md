# 💎 Shrigar Jewellers — Management System

![Version](https://img.shields.io/badge/Version-1.0.0-gold)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Offline](https://img.shields.io/badge/Works-100%25%20Offline-green)
![License](https://img.shields.io/badge/License-MIT-blue)

A **complete, offline-first Jewelry Management System** built for Indian jewelry shops. Manage your entire business — billing, inventory, customers, repairs, and reports — all from a single desktop application. No internet required, no subscription fees, your data stays on your computer.

---

## ✨ Features

- 🧾 **Billing & Invoicing (GST)** — Generate GST-compliant bills/invoices with PDF, track payments
- 🖥️ **POS (Point of Sale)** — Fast billing at the counter with barcode search, cash/card/UPI payment
- 📦 **Inventory Management** — Products, categories, barcode support, low-stock alerts
- 👥 **Customer Management** — Customer profiles, purchase history, loyalty points
- 🏭 **Production / Making** — Track jewellery making jobs, Bill of Materials
- 🔧 **Repairs** — Job cards for repair work with status tracking
- 🛒 **Purchases & Suppliers** — Purchase orders, goods receiving workflow
- 📊 **Reports & Analytics** — Sales trends, GST reports, inventory valuation, top products
- 💰 **Old Gold** — Track old gold exchange transactions
- ⚙️ **Settings** — Store details, GST config, daily gold rates, user management
- 💾 **Auto-Backup** — Daily automatic backup at 11 PM to `~/ShrigarJewellers/backups/`
- 🔐 **Role-Based Access** — Admin, Manager, Staff, Accountant roles

---

## 📸 Screenshots

| Dashboard | POS / Billing | Inventory |
|-----------|---------------|-----------|
| KPI cards + charts | Fast billing counter | Product list with filters |

---

## 🖥️ System Requirements

| Component | Minimum |
|-----------|---------|
| **Operating System** | Windows 10/11 (64-bit), macOS 11+, Ubuntu 20.04+ |
| **RAM** | 4 GB (8 GB recommended) |
| **Disk Space** | 2 GB free |
| **Display** | 1024 × 768 minimum |
| **Internet** | Not required after installation |

---

## 🚀 Installation (Desktop App)

1. Download **ShrigarJewellers-Setup.exe** (Windows) or **ShrigarJewellers.dmg** (macOS)
2. Double-click the installer
3. Follow the setup wizard — choose install directory
4. Launch **Shrigar Jewellers** from your Desktop or Start Menu
5. Complete the **First-Run Setup Wizard** to configure your store

---

## 🏪 First Run — Setup Wizard

When you open the app for the first time, a **Setup Wizard** will guide you through:

1. **Welcome Screen** — Overview of the setup steps
2. **Shop Details** — Store name, address, city, state, PIN code, phone, WhatsApp, email
3. **Admin Account** — Create the admin login for your store
4. **GST & Tax Details** — GSTIN, state, HSN code, CGST/SGST rates
5. **Invoice / Bill Format** — Bill prefix (e.g. `SJ-`), starting number, footer text, bank details

After setup, you will be taken directly to the dashboard.

---

## 🔧 Developer Setup (Docker)

```bash
# Clone the repo
git clone https://github.com/Sampatel31/jewelry-management.git
cd jewelry-management

# Start all services (PostgreSQL + Redis + Backend + Frontend)
docker-compose up -d

# Wait ~30 seconds for services to start, then open:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api/health
```

**Default Credentials (development):**
- Email: `admin@shrigarjewellers.com`
- Password: `Admin@123`

---

## 🔧 Manual Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+ (optional — caching gracefully disabled if unavailable)

### 1. Backend
```bash
cd backend
npm install
cp ../.env.example .env
# Edit .env with your database credentials
npm run migrate
npm run seed
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

### 3. Electron (Desktop App)
```bash
cd electron
npm install
npm start
```

---

## 💾 Backup & Restore

### Automatic Backups
Daily backups run automatically at **11 PM** and are saved to:
```
~/ShrigarJewellers/backups/backup-YYYY-MM-DD.sql
```
Last 30 backups are kept automatically.

### Manual Backup
- Open the app → Settings → **Backup & Restore** → "Create Backup Now"
- Or via system tray → "Create Backup Now"

### Restore
```bash
psql -U jewelry_user -d jewelry_db < ~/ShrigarJewellers/backups/backup-2024-01-01.sql
```

---

## 🔒 Security & Privacy

- **100% Offline** — No internet required, no data leaves your computer
- **Your data belongs to you** — See [DATA_OWNERSHIP.md](DATA_OWNERSHIP.md)
- **JWT authentication** — 15-minute access tokens + rotating refresh tokens
- **Role-based access control** — Admin, Manager, Staff, Accountant
- **Audit logs** — All changes tracked with user and timestamp

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` |
| Products | `GET/POST /products`, `GET/PUT/DELETE /products/:id` |
| Billing | `GET/POST /billing/invoices`, `GET /billing/invoices/:id/pdf` |
| POS | `POST /pos/sale`, `GET /pos/search` |
| Customers | `GET/POST /customers`, `GET/PUT/DELETE /customers/:id` |
| Reports | `GET /reports/dashboard`, `GET /reports/sales`, `GET /reports/gst` |
| Settings | `GET/PUT /settings`, `GET/POST /settings/metal-rates` |
| Backup | `GET /backup/export`, `GET /backup/list` |
| Health | `GET /health` (no auth required) |

---

## 📜 Legal

- [LICENSE](LICENSE) — MIT License
- [PRIVACY_POLICY.md](PRIVACY_POLICY.md) — How your data is handled
- [TERMS_OF_SERVICE.md](TERMS_OF_SERVICE.md) — Terms of use
- [DATA_OWNERSHIP.md](DATA_OWNERSHIP.md) — Your data rights

---

## 📞 Support

**Email:** support@shrigarjewellers.com

---

© 2024 Shrigar Jewellers. All rights reserved.
