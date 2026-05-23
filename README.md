# Celium

Celium is a React + TypeScript route discovery and trip planning app backed by a .NET 8 API, PostgreSQL, and Auth0. The frontend starts at the Auth0 gate and sends authenticated users directly into the Celium workspace.

## Project layout
- `/frontend`: Vite React app with Auth0 and Celium UI
- `/backend/Celium.Api`: .NET 8 API for route CRUD and Auth0 bearer auth
- `/backend/Celium.sln`: backend solution

## Quick start

### Required environment variables

Backend (`backend/Celium.Api/appsettings.Development.json`):
- `ConnectionStrings:Default`: `Host=localhost;Port=5432;Database=Celium;Username=Celium;Password=your_password`
- `Auth0:Domain`: `your-tenant.us.auth0.com`
- `Auth0:Audience`: `https://api.celium.dev`
- `Auth0:RoleClaim`: `https://celium.app/roles` (optional)

Frontend (`frontend/.env.local`):
- `VITE_AUTH0_DOMAIN`: `your-tenant.us.auth0.com`
- `VITE_AUTH0_CLIENT_ID`: Auth0 SPA client id
- `VITE_AUTH0_AUDIENCE`: `https://api.celium.dev`
- `VITE_CELIUM_API_URL`: `http://localhost:5270`

### Backend
```bash
cd backend/Celium.Api
dotnet build
dotnet ef database update
dotnet run
```

Swagger: `https://localhost:5270/swagger`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. Unauthenticated users see the Auth0 sign-in screen, then land in `/explore`.

### All services
```bash
npm install
npm run dev
```

## Tests
```bash
cd frontend
npm test

cd ../backend/Celium.Api
dotnet test --no-restore
```
