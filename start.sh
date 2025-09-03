#!/bin/bash

echo "🚀 Rummy Cookies Mail Server Başlatılıyor..."
echo

# Node.js yüklü mü kontrol et
if ! command -v node &> /dev/null; then
    echo "❌ Node.js yüklü değil! Lütfen Node.js'i yükleyin."
    echo "📥 İndirme linki: https://nodejs.org/"
    exit 1
fi

# Bağımlılıkları kontrol et
if [ ! -d "node_modules" ]; then
    echo "📦 Bağımlılıklar yükleniyor..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Bağımlılık yükleme hatası!"
        exit 1
    fi
fi

echo "✅ Bağımlılıklar hazır"
echo "🌐 Mail server başlatılıyor..."
echo "📧 SMTP: rumycookieinfo@gmail.com"
echo "👤 Admin: kurkayayazilim@gmail.com"
echo "🔗 Health Check: http://localhost:3001/health"
echo

npm start
