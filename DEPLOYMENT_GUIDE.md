# 🚀 Deployment & Setup Guide

**Tarih:** 18 Şubat 2026  
**Amaç:** Yeni bilgisayaralarda (Windows/Mac/Linux) sistem kurulumu

---

## 📋 İçerik

1. [GitHub'dan Clone Et](#githubdan-clone-et)
2. [Ortam Değişkenlerini Ayarla](#ortam-değişkenlerini-ayarla)
3. [Bağımlılıkları Kur](#bağımlılıkları-kur)
4. [Uygulamayı Başlat](#uygulamayı-başlat)
5. [Güvenlik Checklist'i](#güvenlik-checklisti)
6. [Veri Taşıma (Mevcut Hastalardan)](#veri-taşıma)

---

## GitHub'dan Clone Et

### Windows / macOS / Linux Ortaklaştırılmış Adımlar

```bash
# 1. Repository'yi clone et
git clone https://github.com/zaferyildirim-1/patient_record_system.git
cd patient_record_system

# 2. Node.js ve npm yüklü olduğunu doğrula
node --version  # v18+ gereklidir
npm --version   # v9+ gereklidir
```

**Not:** Windows'ta:
- [Node.js LTS](https://nodejs.org/) indir ve kur
- Command Prompt veya PowerShell'de clone komutu çalıştır

---

## Ortam Değişkenlerini Ayarla

### Step 1: `.env` Dosyası Oluştur

```bash
# .env.example'den template oluştur
cp .env.example .env
```

### Step 2: `.env`'yi Düzenle

`.env` dosyasındaki boş alanları doldur:

```dotenv
# OpenAI API Key - İsteğe bağlı (Word dosyasından hasta datası çıkarmak için)
OPENAI_API_KEY=sk-your-actual-key-here

# Session Security - MUTLAKA doldur (güvenlik anahtarı)
SESSION_SECRET=your-64-char-hex-string

# Admin Credentials - MUTLAKA doldur ve değiştir
APP_USER=your-choosen-username
APP_PASSWORD=your-strong-password-here

# DOCX Import - İsteğe bağlı (Word dosyalarını nereye koy)
DOCX_IMPORT_FOLDER=/path/to/your/docx/files
```

### Step 3: Güçlü bir SESSION_SECRET Oluştur

Terminal'de aşağıdaki komutu çalıştır ve çıktıyı `.env`'ye yapıştır:

```bash
# macOS/Linux:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Windows (PowerShell):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Örnek SESSION_SECRET output:**
```
a7f3c9e1d4b2f8a6c1e9d7f3b5a2c8e1f0a3d6c9e2b5f8a1d4c7e0a3f6b9d2
```

---

## Bağımlılıkları Kur

```bash
npm install
```

**Kurulacak Ana Paketler:**
- `express` - Web sunucusu
- `ejs` - Template engine (HTML)
- `sqlite3` / `sql.js` - Veritabanı
- `bcrypt` - Şifre şifreleme
- `express-session` - Oturum yönetimi
- `dotenv` - Ortam değişkenleri
- `openai` - DOCX import (opsiyonel)

---

## Uygulamayı Başlat

### Development Ortamında

```bash
npm start
```

Tarayıcıda aç: **http://localhost:3000**

### Geliştirme Sırasında (otomatik reload)

```bash
npm run dev
```

---

## Güvenlik Checklist'i

Uygulamayı prodüksiyona koymadan önce:

- [x] `.env` dosyasını `.gitignore`'da kontrol ettiniz mi?
  ```bash
  cat .gitignore | grep "^.env"
  ```

- [x] `.env` dosyasında:
  - [ ] Güçlü bir `SESSION_SECRET` var mı?
  - [ ] `APP_PASSWORD` değiştirilmiş mi?
  - [ ] OpenAI anahtarı (varsa) doğru mu?

- [x] Örnek veriyle test ettiniz mi?
  ```bash
  npm run generate:sample-data
  ```

- [x] `.env` dosyasını ASLA repo'ya commit etmeyin!
  ```bash
  git status | grep ".env"  # Boş çıkmalı
  ```

---

## Veri Taşıma

### Mevcut Hastalardan (Word/CSV) Aktarma

#### Option 1: CSV Dosyasından Import

Mevcut hastaları CSV formatında diser varsa:

```bash
# Dosyayı imports/ klasörüne koy
mkdir -p ./imports
cp your_patients.csv ./imports/

# Manual olarak web arayüzde gir
# Até biraz daha karmaşık ise aşağıdaki scripti kullan:
node scripts/import-from-csv.js ./imports/your_patients.csv
```

#### Option 2: Word Dosyalarından Import (OpenAI)

DOCX dosyalarından otomatik çıkarma:

```bash
# .env'de DOCX_IMPORT_FOLDER ayarladığınızdan emin olun
export DOCX_IMPORT_FOLDER="/path/to/your/docx/files"

# Import scriptini çalıştır
node scripts/batch-import-gpt4o.js /path/to/file1.docx /path/to/file2.docx
```

#### Option 3: Manual Giriş

Web arayüzü üzerinden:
1. Giriş yap
2. "Yeni Hasta Ekle"
3. Her hasta için muayene kayıtlarını ekle

### Veritabanı Yedeklemesi

Mevcut sistem verileriniz yedeğini alın:

```bash
# Manuel backup al
npm run export:csv

# Dosyalar şu klasöre kaydedilir:
# ./backups/manual/patients-*.csv
# ./backups/manual/medical-records-*.csv
```

Günlük otomatik backup kurulum (macOS):
```bash
# Mevcut launchagent'ları yükle
launchctl load ~/Library/LaunchAgents/com.clinic.backup.*, plist
```

---

## Sorun Giderme

### Problem: Port 3000 zaten kullanımda

```bash
# Farklı port kullanışt
PORT=3001 npm start

# Veya mevcut process'i sonlandır:
# macOS/Linux:
sudo lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Windows (PowerShell):
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### Problem: npm install hatası

```bash
# Cache temizle
npm cache clean --force

# Tekrar yükle
npm install
```

### Problem: OpenAI API hatası

```bash
# OpenAI anahtarını kontrol et
echo $OPENAI_API_KEY

# API Key geçersiz mi?
# https://platform.openai.com/account/api-keys adresine git
```

---

## Sistem Gereksinimleri

| Yazılım | Minimum | Önerilen |
|---------|--------|----------|
| Node.js | 16.x | 18+ LTS |
| npm | 8.x | 9+ |
| RAM | 512 MB | 2 GB+ |
| Disk | 500 MB | 2 GB |
| OS | Windows 10/11, macOS 10.15+, Ubuntu 20.04+ | Aynı |

---

## İletişim & Destek

Sorun varsa:
1. `SETUP_COMPLETE.md` kontrol et
2. GitHub Issues açabilirsiniz
3. Log dosyalarını kontrol et: `./logs/`

---

**Başarılar!** 🎉

Sistem başarıyla kurulmuş mu? Daha sonra database iyileştirmelerini ve yeni alanları eklemek için `DATABASE_SCHEMA.md`'e bakabilirsiniz.
