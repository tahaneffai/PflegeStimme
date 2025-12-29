# PowerShell script to start PostgreSQL in Docker
# Make sure Docker Desktop is running first!

Write-Host "🚀 Starting PostgreSQL in Docker..." -ForegroundColor Cyan

# Check if container already exists
$existing = docker ps -a --filter "name=postgres-awareness" --format "{{.Names}}"

if ($existing -eq "postgres-awareness") {
    Write-Host "✅ Container exists, starting it..." -ForegroundColor Yellow
    docker start postgres-awareness
} else {
    Write-Host "📦 Creating new PostgreSQL container..." -ForegroundColor Yellow
    docker run --name postgres-awareness `
        -e POSTGRES_PASSWORD=password `
        -e POSTGRES_DB=awareness_db `
        -p 5432:5432 `
        -d postgres
}

Start-Sleep -Seconds 3

# Check if it's running
$status = docker ps --filter "name=postgres-awareness" --format "{{.Status}}"

if ($status) {
    Write-Host "`n✅ PostgreSQL is running!" -ForegroundColor Green
    Write-Host "`n📝 Connection details:" -ForegroundColor Cyan
    Write-Host "   Host: localhost" -ForegroundColor White
    Write-Host "   Port: 5432" -ForegroundColor White
    Write-Host "   Database: awareness_db" -ForegroundColor White
    Write-Host "   Username: postgres" -ForegroundColor White
    Write-Host "   Password: password" -ForegroundColor White
    Write-Host "`n🔗 DATABASE_URL:" -ForegroundColor Cyan
    Write-Host '   postgresql://postgres:password@localhost:5432/awareness_db' -ForegroundColor Yellow
    Write-Host "`n💡 Update your .env.local file with the DATABASE_URL above" -ForegroundColor Green
} else {
    Write-Host "`n❌ Failed to start PostgreSQL" -ForegroundColor Red
    Write-Host "💡 Make sure Docker Desktop is running!" -ForegroundColor Yellow
}

