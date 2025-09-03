@echo off
echo 🚀 Rummy Cookies Mail Server Başlatılıyor...
echo.

REM Node.js yüklü mü kontrol et
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js yüklü değil! Lütfen Node.js'i yükleyin.
    echo 📥 İndirme linki: https://nodejs.org/
    pause
    exit /b 1
)

REM Bağımlılıkları kontrol et
if not exist "node_modules" (
    echo 📦 Bağımlılıklar yükleniyor...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Bağımlılık yükleme hatası!
        pause
        exit /b 1
    )
)

echo ✅ Bağımlılıklar hazır
echo 🌐 Mail server başlatılıyor...
echo 📧 SMTP: rumycookieinfo@gmail.com
echo 👤 Admin: kurkayayazilim@gmail.com
echo 🔗 Health Check: http://localhost:3001/health
echo.

npm start

pause
