#!/bin/bash

# Hasta Kayıt Sistemi - Başlatıcı
PROJECT_DIR="/Users/zaferyildirim/Desktop/huseyin_sert"

echo "🏥 Hasta Kayıt Sistemi Başlatılıyor..."
echo ""
echo "✅ Sunucu başlatılıyor..."

# Eski sunucuyu kapat
pkill -f "node.*src/server.js" 2>/dev/null || true
sleep 1

# Proje dizinine git ve sunucuyu başlat
cd "$PROJECT_DIR"
node src/server.js &

sleep 2
echo ""
echo "✅ Sistem hazır!"
echo "📱 Tarayıcınızda açın: http://localhost:3000"
echo ""
echo "⚠️  Bu pencereyi KAPATMAYIN (sunucu çalışıyor)"
echo "🛑 Durdurmak için: Ctrl+C veya bu pencereyi kapatın"
echo ""

# Tarayıcıyı otomatik aç
open http://localhost:3000

# Sunucu çalışmaya devam etsin
wait
