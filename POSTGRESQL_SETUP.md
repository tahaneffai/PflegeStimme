# PostgreSQL Setup Guide for Windows

## Quick Options

### Option 1: Docker (Easiest - Recommended) ⭐
### Option 2: Install PostgreSQL Locally
### Option 3: Use Cloud Database (No Installation)

---

## Option 1: Docker (Easiest) ⭐

### Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) for Windows

### Steps

1. **Install Docker Desktop** (if not installed):
   - Download from: https://www.docker.com/products/docker-desktop/
   - Install and restart your computer
   - Make sure Docker Desktop is running

2. **Run PostgreSQL in Docker**:
   ```powershell
   docker run --name postgres-awareness -e POSTGRES_PASSWORD=password -e POSTGRES_DB=awareness_db -p 5432:5432 -d postgres
   ```

3. **Verify it's running**:
   ```powershell
   docker ps
   ```
   You should see the postgres container running.

4. **Update `.env.local`**:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/awareness_db"
   ADMIN_PASSWORD="12345678"
   ADMIN_SECRET="change-this-to-a-random-secret-in-production"
   ```

5. **Test connection**:
   ```powershell
   docker exec -it postgres-awareness psql -U postgres -d awareness_db
   ```
   Type `\q` to exit.

### Docker Commands Reference

```powershell
# Start container (if stopped)
docker start postgres-awareness

# Stop container
docker stop postgres-awareness

# View logs
docker logs postgres-awareness

# Remove container (if needed)
docker stop postgres-awareness
docker rm postgres-awareness
```

---

## Option 2: Install PostgreSQL Locally

### Steps

1. **Download PostgreSQL**:
   - Go to: https://www.postgresql.org/download/windows/
   - Download the installer (e.g., "Download the installer")
   - Or use: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

2. **Install PostgreSQL**:
   - Run the installer
   - **Remember the password** you set for the `postgres` user
   - Default port: `5432` (keep it)
   - Default locale: `English, United States` (or your preference)

3. **Verify Installation**:
   - Open **pgAdmin 4** (installed with PostgreSQL)
   - Or use command line:
   ```powershell
   psql -U postgres
   ```
   Enter your password when prompted.

4. **Create Database**:
   ```sql
   CREATE DATABASE awareness_db;
   \q
   ```

5. **Update `.env.local`**:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/awareness_db"
   ADMIN_PASSWORD="12345678"
   ADMIN_SECRET="change-this-to-a-random-secret-in-production"
   ```
   Replace `YOUR_PASSWORD` with the password you set during installation.

6. **Test Connection**:
   ```powershell
   psql -U postgres -d awareness_db
   ```
   Type `\q` to exit.

### Windows Service

PostgreSQL runs as a Windows service. To manage it:

```powershell
# Check if PostgreSQL is running
Get-Service postgresql*

# Start PostgreSQL service
Start-Service postgresql-x64-15  # (version number may vary)

# Stop PostgreSQL service
Stop-Service postgresql-x64-15
```

Or use Services app:
- Press `Win + R`, type `services.msc`
- Find "postgresql" service
- Right-click → Start/Stop

---

## Option 3: Cloud Database (No Installation) ⭐ For Production

### Best Options:

#### A. Vercel Postgres (Recommended for Vercel)
1. Go to your Vercel project
2. Click **Storage** tab
3. Click **Create Database** → **Postgres**
4. Copy the connection string
5. Add to Vercel Environment Variables as `DATABASE_URL`

#### B. Supabase (Free Tier)
1. Go to: https://supabase.com
2. Sign up / Login
3. Create new project
4. Go to **Settings** → **Database**
5. Copy **Connection string** (URI)
6. Use it in `.env.local` or Vercel

#### C. Neon (Serverless PostgreSQL)
1. Go to: https://neon.tech
2. Sign up / Login
3. Create new project
4. Copy connection string
5. Use it in `.env.local` or Vercel

#### D. Railway
1. Go to: https://railway.app
2. Sign up / Login
3. New Project → Add PostgreSQL
4. Copy connection string
5. Use it in `.env.local` or Vercel

---

## After Setup: Run Your Project

Once PostgreSQL is running:

1. **Update `.env.local`** with correct `DATABASE_URL`

2. **Generate Prisma Client**:
   ```powershell
   npx prisma generate
   ```

3. **Create Database Tables**:
   ```powershell
   npx prisma migrate dev --name init
   ```

4. **Fix Admin Password**:
   ```powershell
   node scripts/fix-admin-password.js
   ```

5. **Start Dev Server**:
   ```powershell
   npm run dev
   ```

---

## Troubleshooting

### "Connection refused" or "Cannot connect"
- ✅ Check PostgreSQL is running: `docker ps` (Docker) or `Get-Service postgresql*` (Local)
- ✅ Verify port 5432 is not blocked by firewall
- ✅ Check DATABASE_URL in `.env.local` is correct

### "Authentication failed"
- ✅ Verify username and password in DATABASE_URL
- ✅ For local: Check password you set during installation
- ✅ For Docker: Use password from docker run command

### "Database does not exist"
- ✅ Create database: `CREATE DATABASE awareness_db;`
- ✅ Or use Docker with `-e POSTGRES_DB=awareness_db` flag

### "Table does not exist"
- ✅ Run migrations: `npx prisma migrate dev --name init`

---

## Quick Start Commands (Docker)

```powershell
# Start PostgreSQL
docker run --name postgres-awareness -e POSTGRES_PASSWORD=password -e POSTGRES_DB=awareness_db -p 5432:5432 -d postgres

# Check if running
docker ps

# View logs
docker logs postgres-awareness

# Stop PostgreSQL
docker stop postgres-awareness

# Start again (after stop)
docker start postgres-awareness

# Remove (if you want to start fresh)
docker stop postgres-awareness
docker rm postgres-awareness
```

---

## Recommendation

- **For Development**: Use **Docker** (Option 1) - Easy to set up and remove
- **For Production/Vercel**: Use **Cloud Database** (Option 3) - Vercel Postgres or Supabase

