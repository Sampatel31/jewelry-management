# Contributing to Jewelry Management System

Thank you for your interest in contributing! This guide will help you get started.

## Development Environment Setup

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (for PostgreSQL + Redis)
- Git

### Backend
```bash
cd backend
npm install
cp ../.env.example .env   # fill in your values
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp ../.env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev
```

### Database
```bash
# Start Postgres + Redis via Docker
docker-compose up -d db redis

# Run migrations
cd backend && npm run migrate
# (Optional) Seed sample data
npm run seed
```

## Pull Request Process

1. Fork the repository and create a feature branch from `main`.
2. Make your changes with clear, focused commits.
3. Ensure all CI checks pass (lint, typecheck, tests, build).
4. Open a PR with a descriptive title and summary of changes.
5. At least one maintainer review is required before merging.
6. Squash commits when merging.

## Code Style

### TypeScript
- All new code must be TypeScript. Avoid `any` where possible.
- Both `backend/tsconfig.json` and `frontend/tsconfig.json` use `strict: false`; do not introduce new type errors.
- Prefer explicit return types on exported functions.

### ESLint
- Backend: `npm run lint` (uses `@typescript-eslint` recommended rules).
- Frontend: `npm run lint` (uses Next.js ESLint config).
- Fix all errors; warnings should be minimised.

### Prettier
A root `.prettierrc` is provided. Format your code before committing:
```bash
npx prettier --write .
```

## Testing Requirements

- Unit tests live in `backend/src/__tests__/` and must be suffixed `.test.ts`.
- Run tests with `npm test` inside the `backend` directory.
- New utility functions should include unit tests.
- Tests must not require a running database or external services.

## Commit Messages

Use the imperative mood in the subject line (e.g. "Add GST calculation tests").  
Reference related issues with `Fixes #<number>` or `Closes #<number>`.
