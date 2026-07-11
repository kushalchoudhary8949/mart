# Vrindawan Mart Backend - Step 1

This is the production-grade Node.js/Express/TypeScript backend for the Vrindawan Mart grocery delivery application.

---

## 🛠️ Step 1 Architecture
This step initializes the backend project folder with:
- **Express + TypeScript** core engine configured with strict type-safety, helmet headers, compression, and CORS.
- **Winston + Morgan** integrated logging system streaming stdout/stderr to `/logs/` files and terminal.
- **Custom AppError** and centralized Express error handlers mapping Zod and Prisma Client validation exceptions.
- **Docker Compose** defining PostgreSQL and Redis service dependency configurations.
- **Prisma ORM** setup pointing to PostgreSQL datasource with connection health checking.
- **Zod-validated** environment configurations.
- **Health check** endpoint at `GET /api/v1/health` providing service dependencies status.

---

## 🚀 Local Development Setup

### 1. Pre-requisites (Docker Desktop on macOS)
Since PostgreSQL and Redis are containerized:
- Download and install **Docker Desktop for Mac**:
  [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
- Make sure Docker is running by checking the menu bar icon or running `docker ps` in your terminal.

### 2. Start PostgreSQL & Redis services
Run the following command from the `backend/` directory to start the database and cache in the background:
```bash
docker compose up -d postgres redis
```
Verify they are running:
```bash
docker compose ps
```

### 3. Install NPM Dependencies
Install backend dependencies locally:
```bash
npm install
```

### 4. Apply Database Migrations & Client Generation
Run Prisma migrations to initialize the schema:
```bash
npx prisma migrate dev --name init
```
Generate the Prisma Client code:
```bash
npm run prisma:generate
```

### 5. Start Backend Server
Run the dev server with hot reload:
```bash
npm run dev
```

### 6. Verify Server Health
Check the service status:
```bash
curl http://localhost:5000/api/v1/health
```

---

## 📁 Folder Structure

- `src/config/`: Configuration validators (index.ts), Database singletons (database.ts, redis.ts), and Log configurations (logger.ts).
- `src/middlewares/`: Express interceptors (errorHandler, rateLimiter, requestLogger).
- `src/utils/`: Custom AppError, constants and utility helpers.
- `src/controllers/`: Route handlers (healthCheck).
- `src/routes/`: Route routers (index, health.routes).
- `prisma/`: Prisma schema.
