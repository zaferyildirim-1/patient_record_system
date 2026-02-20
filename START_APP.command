#!/bin/bash

# Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi Başlatıcı
# Bu dosyaya çift tıklayarak uygulamayı başlatabilirsiniz

# Terminal'i temizle
clear

# Script'in bulunduğu dizine git
cd "$(dirname "$0")"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🏥  Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Port 3000'i temizle
echo "🔍 Port kontrolü yapılıyor..."
if lsof -ti :3000 > /dev/null 2>&1; then
    echo "⚠️  Port 3000 kullanımda, temizleniyor..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null
    sleep 2
    echo "✅ Port temizlendi"
fi

# Node.js kurulu mu kontrol et
if ! command -v node &> /dev/null; then
    echo ""
    echo "❌ HATA: Node.js bulunamadı!"
    echo ""
    echo "Node.js'i yüklemek için:"
    echo "https://nodejs.org adresine gidin"
    echo ""
    read -p "Kapatmak için Enter'a basın..."
    exit 1
fi

echo "✅ Node.js: $(node --version)"

# Dependencies kurulu mu kontrol et
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 İlk çalıştırma - Bağımlılıklar kuruluyor..."
    echo "   (Bu işlem birkaç dakika sürebilir)"
    npm install --silent
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Server başlatılıyor..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Server'ı başlat
npm start > /dev/null 2>&1 &
SERVER_PID=$!

# Server'ın başlamasını bekle
echo "⏳ Server hazırlanıyor..."
for i in {1..10}; do
    if lsof -ti :3000 > /dev/null 2>&1; then
        break
    fi
    sleep 1
    echo "   Bekleniyor... ($i/10)"
done

# Server başladı mı kontrol et
if lsof -ti :3000 > /dev/null 2>&1; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✅ BAŞARILI - Uygulama Çalışıyor!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🌐 Adres:       http://localhost:3000"
    echo "👤 Kullanıcı:   admin"
    echo "🔑 Şifre:       password"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Tarayıcıyı aç
    sleep 2
    echo "🌍 Tarayıcı açılıyor..."
    open http://localhost:3000/login
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  ÖNEMLİ UYARILAR:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "   • Bu pencereyi KAPATMAYIN!"
    echo "   • Pencereyi kapatırsanız uygulama kapanır"
    echo "   • Uygulamayı durdurmak için Ctrl+C'ye basın"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📊 Server Logları:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Server process'ini takip et
    wait $SERVER_PID
    
    echo ""
    echo "🛑 Server durduruldu."
    read -p "Kapatmak için Enter'a basın..."
else
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "❌ HATA: Server başlatılamadı!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Lütfen Terminal'de şu komutu çalıştırın:"
    echo "cd $(pwd) && npm start"
    echo ""
    read -p "Kapatmak için Enter'a basın..."
    exit 1
fi
