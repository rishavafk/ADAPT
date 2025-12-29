# Quick script to run the project locally
Write-Host "=== Neuro-Aid Local Development ===" -ForegroundColor Cyan
Write-Host ""

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "DATABASE_URL is not set!" -ForegroundColor Red
    Write-Host ""
    Write-Host "You need to set up a PostgreSQL database connection." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "1. Use Supabase (free): https://supabase.com" -ForegroundColor White
    Write-Host "2. Use Neon (free): https://neon.tech" -ForegroundColor White
    Write-Host "3. Install PostgreSQL locally" -ForegroundColor White
    Write-Host ""
    Write-Host "Once you have a database, set DATABASE_URL:" -ForegroundColor Yellow
    Write-Host '   $env:DATABASE_URL="postgresql://user:password@host:port/database"' -ForegroundColor White
    Write-Host ""
    Write-Host "Then run this script again." -ForegroundColor Yellow
    exit 1
}

# Set environment variables
$env:NODE_ENV = "development"
if (-not $env:PORT) {
    $env:PORT = "5000"
}

Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "Server will be available at: http://localhost:$env:PORT" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the dev server
npm run dev

