# Broken Empires Vault

Full-stack TypeScript app: an Angular frontend talking to a NestJS API backed by MongoDB.

| Part | Stack | Dev URL |
| --- | --- | --- |
| [`frontend/`](frontend) | Angular 21, Tailwind CSS 4, Vitest | http://localhost:4200 |
| [`backend/`](backend) | NestJS 12, Mongoose, Jest | http://localhost:3000/api |

## Getting started

Prerequisites: Node 24+ and a running MongoDB instance.

```bash
# Backend
cd backend
npm install
cp .env.example .env   # then set MONGODB_URI
npm run start:dev

# Frontend (in a second terminal)
cd frontend
npm install
npm start
```

The Angular dev server proxies `/api/*` to the backend (see
[`frontend/proxy.conf.json`](frontend/proxy.conf.json)), so no CORS setup or
hard-coded API URLs are needed locally. If you host the frontend on a different
origin from the API, set `CORS_ORIGIN` in the backend environment.

## Tests

```bash
cd backend  && npm test && npm run test:e2e   # DB is mocked, none required
cd frontend && npm test
```

## Shared types

Types used by both sides live in [`backend/src/shared/`](backend/src/shared).
The backend imports them relatively; the frontend imports them through the
`@shared/*` path alias (see `frontend/tsconfig.json`), and
`frontend/tsconfig.app.json` sets `rootDir` to the repo root so the compiler
accepts source files from outside `frontend/`.

Keep that folder to **type-only** modules (interfaces / type aliases). Anything
with runtime code or Nest/Mongoose imports would get bundled into the browser
build. If the shared surface grows, promote it to its own workspace package.
