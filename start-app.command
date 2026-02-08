#!/bin/zsh

# Resolve to project root even when double-clicked from Finder
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# Check Node.js availability
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js bulunamadı. Lütfen Node.js kurulu olduğundan emin olun."
  read "?Kapatmak için Enter'a basın..."
  exit 1
fi

# Warn if port 3000 already in use
if lsof -nP -iTCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Uyarı: 3000 portu zaten kullanımda. Sunucu başlatılamadı."
  echo "Portu kullanan süreci kapatıp tekrar deneyin."
  read "?Kapatmak için Enter'a basın..."
  exit 1
fi

echo "Hasta kayıt uygulaması başlatılıyor..."

echo "Sunucuyu durdurmak için Terminal penceresinden Ctrl + C yapabilirsiniz."

echo "------------------------------------------------------------"

npm start

EXIT_CODE=$?

echo "------------------------------------------------------------"
if [ "$EXIT_CODE" -eq 0 ]; then
  echo "Sunucu kapatıldı."
else
  echo "Sunucu beklenmedik şekilde durdu (kod: $EXIT_CODE)."
fi

read "?Pencereyi kapatmak için Enter'a basın..."
