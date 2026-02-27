# 💎 JewelMS — Shrigar Jewellers Management System

> **Free Desktop App for Indian Jewelry Shops** — No subscription, no cloud, your data stays with you.

[![Download for Windows](https://img.shields.io/badge/Download-Windows%20.exe-blue?style=for-the-badge&logo=windows)](https://github.com/Sampatel31/jewelry-management/releases/latest)
[![Download for macOS](https://img.shields.io/badge/Download-macOS%20.dmg-black?style=for-the-badge&logo=apple)](https://github.com/Sampatel31/jewelry-management/releases/latest)
[![Download for Linux](https://img.shields.io/badge/Download-Linux%20.AppImage-orange?style=for-the-badge&logo=linux)](https://github.com/Sampatel31/jewelry-management/releases/latest)

![Version](https://img.shields.io/badge/Version-1.0.0-gold)
![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Offline](https://img.shields.io/badge/Works-100%25%20Offline-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![CI](https://github.com/Sampatel31/jewelry-management/actions/workflows/ci.yml/badge.svg)

---

## ⬇️ Download

| Platform | Download |
|----------|----------|
| **Windows 10/11** | [ShrigarJewellers-Setup.exe](https://github.com/Sampatel31/jewelry-management/releases/latest) |
| **macOS 11+** | [ShrigarJewellers.dmg](https://github.com/Sampatel31/jewelry-management/releases/latest) |
| **Linux** | [ShrigarJewellers.AppImage](https://github.com/Sampatel31/jewelry-management/releases/latest) |

All releases are built automatically by GitHub Actions and are free to download.

---

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

> **Add real screenshots here** — replace the placeholders with actual app screenshots after first run.

| Dashboard | POS / Billing | Inventory |
|-----------|---------------|-----------|
| ![Dashboard](docs/screenshots/dashboard.png) | ![POS](docs/screenshots/pos.png) | ![Inventory](docs/screenshots/inventory.png) |
| KPI cards + sales charts | Fast billing counter | Product list with filters |

| Repairs | Settings | Reports |
|---------|----------|---------|
| ![Repairs](docs/screenshots/repairs.png) | ![Settings](docs/screenshots/settings.png) | ![Reports](docs/screenshots/reports.png) |
| Job card Kanban | GST & store config | Sales & GST reports |

*To add screenshots: take a screenshot of the running app, save to `docs/screenshots/` and commit.*

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

**Default Credentials (development only):**
- Email: `admin@shrigarjewellers.com`
- Password: `Admin@123`

> ⚠️ **Note:** On first login, the setup wizard forces a mandatory password change. Default credentials are not shown on the login screen in production builds.

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
| Auth | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `PUT /auth/change-password` |
| Products | `GET/POST /products`, `GET/PUT/DELETE /products/:id` |
| Billing | `GET/POST /billing/invoices`, `GET /billing/invoices/:id/pdf` |
| POS | `POST /pos/sale`, `GET /pos/search` |
| Customers | `GET/POST /customers`, `GET/PUT/DELETE /customers/:id` |
| Reports | `GET /reports/dashboard`, `GET /reports/sales`, `GET /reports/gst` |
| Settings | `GET/PUT /settings`, `GET/POST /settings/metal-rates` |
| Backup | `POST /backup/create`, `GET /backup/list`, `GET /backup/download/:filename`, `GET /backup/export` |
| Health | `GET /health` (no auth required) |

---

## 🤝 Contributing

Contributions are welcome! This is a free, open-source tool for Indian jewelry shop owners.

### Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork: `git clone https://github.com/<your-username>/jewelry-management`
3. **Create a branch**: `git checkout -b feature/your-feature-name`
4. **Make changes** following the existing code style
5. **Test** your changes: `npm test` in `backend/` and `npm run build` in `frontend/`
6. **Commit**: `git commit -m "feat: describe your change"`
7. **Push** and open a **Pull Request**

### Code Style

- **Backend**: TypeScript, Express, Knex.js — follow existing controller/route patterns
- **Frontend**: Next.js 14 App Router, Tailwind CSS, `@tanstack/react-query`
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.)

### Reporting Issues

Open an issue on GitHub with:
- Steps to reproduce
- Expected vs actual behaviour
- Your OS and app version

---

## 📜 Legal

- [LICENSE](LICENSE) — MIT License
- [PRIVACY_POLICY.md](PRIVACY_POLICY.md) — How your data is handled
- [TERMS_OF_SERVICE.md](TERMS_OF_SERVICE.md) — Terms of use
- [DATA_OWNERSHIP.md](DATA_OWNERSHIP.md) — Your data rights

---

## 📞 Support

**Email:** support@shrigarjewellers.com

> **First-run note:** The setup wizard forces a password change on first login. The default admin credentials are not shown on the login screen — contact your administrator for access.

---

© 2025 JewelMS / Shrigar Jewellers. All rights reserved.
