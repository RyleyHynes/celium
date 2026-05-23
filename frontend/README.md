# Celium Frontend

React 19 + TypeScript frontend for Celium, built with Vite, TailwindCSS, Auth0, and Vitest.

## Setup
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment
Create `frontend/.env.local`:
```bash
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=your-spa-client-id
VITE_AUTH0_AUDIENCE=https://api.celium.dev
VITE_CELIUM_API_URL=http://localhost:5270
```

## Scripts
```bash
npm run build
npm run lint
npm run test
npm run test:coverage
```
