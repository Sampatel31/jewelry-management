# API Reference

Base URL: `http://localhost:5000/api`

All endpoints (except Auth) require an `Authorization: Bearer <token>` header.

---

## Authentication

### POST /auth/login
Authenticate and receive access + refresh tokens.

**Body:**
```json
{ "username": "admin", "password": "secret" }
```
**Response `200`:**
```json
{ "token": "<jwt>", "refreshToken": "<jwt>", "user": { "id": 1, "username": "admin", "role": "admin" } }
```

### POST /auth/refresh
Exchange a refresh token for a new access token.

**Body:** `{ "refreshToken": "<jwt>" }`

**Response `200`:** `{ "token": "<jwt>" }`

### POST /auth/logout
Invalidate the refresh token.

**Body:** `{ "refreshToken": "<jwt>" }`

**Response `200`:** `{ "message": "Logged out" }`

### GET /auth/me *(auth required)*
Return the authenticated user's profile.

### PUT /auth/change-password *(auth required)*
**Body:** `{ "currentPassword": "...", "newPassword": "..." }`

---

## Products

All routes require authentication.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | List all products (supports `?search=`, `?category_id=`) |
| GET | `/products/:id` | Get a single product |
| GET | `/products/barcode/:barcode` | Lookup by barcode |
| POST | `/products` | Create product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Soft-delete product |

---

## Categories

| Method | Path | Description |
|--------|------|-------------|
| GET | `/categories` | List categories |
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

---

## Customers

| Method | Path | Description |
|--------|------|-------------|
| GET | `/customers` | List customers |
| GET | `/customers/:id` | Get customer |
| POST | `/customers` | Create customer |
| PUT | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Soft-delete customer |

---

## Suppliers

| Method | Path | Description |
|--------|------|-------------|
| GET | `/suppliers` | List suppliers |
| GET | `/suppliers/:id` | Get supplier |
| POST | `/suppliers` | Create supplier |
| PUT | `/suppliers/:id` | Update supplier |
| DELETE | `/suppliers/:id` | Soft-delete supplier |

---

## Billing / Invoices

| Method | Path | Description |
|--------|------|-------------|
| GET | `/billing/invoices` | List invoices (supports `?customer_id=`, `?status=`) |
| POST | `/billing/invoices` | Create invoice |
| GET | `/billing/invoices/:id` | Get invoice detail |
| PUT | `/billing/invoices/:id` | Update invoice (only if `draft` status) |
| POST | `/billing/invoices/:id/payment` | Record payment |
| GET | `/billing/invoices/:id/pdf` | Download invoice PDF |
| DELETE | `/billing/invoices/:id` | Not allowed – returns `405` |

---

## Purchase Orders

| Method | Path | Description |
|--------|------|-------------|
| GET | `/purchases` | List purchase orders |
| POST | `/purchases` | Create purchase order |
| GET | `/purchases/:id` | Get purchase order |
| PUT | `/purchases/:id` | Update purchase order |

---

## Inventory

| Method | Path | Description |
|--------|------|-------------|
| GET | `/inventory/transactions` | List inventory transactions |
| POST | `/inventory/adjust` | Manual stock adjustment |

---

## Repairs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/repairs` | List repairs |
| POST | `/repairs` | Create repair job |
| GET | `/repairs/:id` | Get repair |
| PUT | `/repairs/:id` | Update repair status |

---

## Production

| Method | Path | Description |
|--------|------|-------------|
| GET | `/production/jobs` | List production jobs |
| POST | `/production/jobs` | Create job |
| PUT | `/production/jobs/:id` | Update job |

---

## Old Gold Transactions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/old-gold` | List transactions |
| POST | `/old-gold` | Record old-gold purchase |

---

## Reports

| Method | Path | Description |
|--------|------|-------------|
| GET | `/reports/sales` | Sales summary (requires `?from=&to=`) |
| GET | `/reports/inventory` | Current stock levels |
| GET | `/reports/gst` | GST report |

---

## Settings

| Method | Path | Description |
|--------|------|-------------|
| GET | `/settings` | Get shop settings |
| PUT | `/settings` | Update settings |

---

## Backup *(admin only)*

| Method | Path | Description |
|--------|------|-------------|
| POST | `/backup/trigger` | Trigger a database backup |

---

## Error Responses

All errors follow:
```json
{ "message": "Human-readable description", "errors": [ /* validation details */ ] }
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 405 | Method not allowed |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
