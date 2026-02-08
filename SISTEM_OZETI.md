# 🏥 Hasta Kayıt Sistemi - Kapsamlı Sistem Özeti

**Proje Adı:** Hasta Kayıt Sistemi (Op Dr. Hüseyin Sert - Kadın Sağlığı Kliniği)  
**Tarih:** Şubat 2026  
**Platform:** Node.js + Express + SQLite (sql.js) Web Uygulaması

---

## 📋 PROJE GENEL BAKIŞ

### Amaç
Kadın sağlığı kliniği için basit, güvenli ve kullanımı kolay hasta kayıt ve muayene takip sistemi.

### Temel Özellikler
- ✅ Hasta kayıt yönetimi (CRUD)
- ✅ Benzersiz hasta kodları (YYYYMMDD-NNN formatı)
- ✅ Muayene geçmişi takibi (sınırsız ziyaret)
- ✅ Jinekologi spesifik alanlar (SAT, menstrüel gün, USG)
- ✅ Günlük ve haftalık otomatik CSV yedekleme
- ✅ DOCX dosyalarından otomatik veri içe aktarma (OpenAI GPT-4o-mini)
- ✅ Bcrypt şifreleme ile güvenli giriş
- ✅ Kalıcı oturum yönetimi (session-file-store)
- ✅ Türkçe dil desteği (tam karakter uyumluluğu)
- ✅ Responsive modern UI

---

## 🏗️ TEKNİK MİMARİ

### Teknoloji Stack'i

**Backend:**
- Node.js (v25.4.0+)
- Express.js 4.x
- sql.js (SQLite in-memory + file persistence)
- bcrypt (şifre hashleme, SALT_ROUNDS=10)
- express-session + session-file-store
- dotenv (environment variables)

**Frontend:**
- EJS (template engine)
- Vanilla CSS (responsive, modern)
- Vanilla JavaScript (analog saat, form validasyonları)

**Yardımcı Kütüphaneler:**
- mammoth.js (DOCX text extraction)
- OpenAI SDK (GPT-4o-mini - hasta verisi parse)
- csv-writer (CSV export)

---

## 📂 DOSYA YAPISI

```
huseyin_sert/
├── src/
│   ├── server.js          # Express server, routing, auth
│   └── database.js        # SQLite operations, schema
├── views/
│   ├── home.ejs           # Dashboard (bugün gelen hastalar)
│   ├── partials/
│   │   └── topbar.ejs     # Navigation bar
│   └── patients/
│       ├── index.ejs      # Hasta listesi (filtreleme)
│       ├── form.ejs       # Yeni hasta / düzenleme formu
│       ├── detail.ejs     # Hasta detay + muayene geçmişi
│       └── record-edit.ejs # Muayene kaydı düzenleme
├── public/
│   └── styles.css         # Tüm CSS stilleri
├── scripts/
│   ├── export-csv.js      # Manuel/otomatik CSV export
│   └── import-from-docx.js # DOCX toplu içe aktarma
├── backups/
│   ├── manual/            # Manuel CSV yedekleri
│   ├── daily/             # Günlük otomatik yedekler
│   └── weekly/            # Haftalık otomatik yedekler
├── .sessions/             # Oturum dosyaları (kalıcı)
├── clinic.db              # SQLite veritabanı
├── .env                   # SENSITIVE! (API keys, secrets)
├── .env.example           # Şablon dosya
├── .gitignore             # Git ignore kuralları
├── start-server.command   # macOS başlatıcı script
└── package.json           # NPM bağımlılıkları
```

---

## 🗄️ VERİTABANI ŞEMASI

### 1. patients Tablosu
```sql
CREATE TABLE patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_code TEXT UNIQUE NOT NULL,      -- YYYYMMDD-NNN
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  birth_date TEXT,                        -- YYYY-MM-DD
  phone_number TEXT,                      -- Serbest format
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. medical_records Tablosu
```sql
CREATE TABLE medical_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  visit_date TEXT NOT NULL,               -- YYYY-MM-DD
  visit_order INTEGER NOT NULL,           -- Kaçıncı ziyaret (1, 2, 3...)
  visit_week TEXT,                        -- Hafta bilgisi (ör: "24. hafta")
  visit_type TEXT,                        -- Muayene türü
  complaint TEXT,                         -- Şikayet
  last_menstrual_date TEXT,               -- SAT
  menstrual_day TEXT,                     -- Adetin kaçıncı günü
  usg TEXT,                               -- USG sonuçları
  diagnosis TEXT,                         -- Teşhis
  outcome TEXT,                           -- Tedavi/reçete
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
```

### 3. users Tablosu
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);
```

---

## 🔐 GÜVENLİK YAPISI

### Environment Variables (.env)
```env
OPENAI_API_KEY=sk-proj-a3f51o...          # OpenAI API anahtarı
SESSION_SECRET=e69660f2...                # 64-char random hex
APP_USER=huseyinsert                      # Admin kullanıcı adı
APP_PASSWORD=huseyinsert213               # Admin şifresi
```

### Güvenlik Önlemleri
1. **Hardcoded Secrets YOK** - Tüm hassas veriler .env'de
2. **Sistem başlamaz** - .env eksik ise uygulama kapanır
3. **Bcrypt Password Hashing** - SALT_ROUNDS=10
4. **Kalıcı Session Storage** - .sessions/ dizini (12 saat TTL)
5. **SQL Injection Koruması** - Parametreli sorgular
6. **Git Ignore** - .env, clinic.db, backups/, .sessions/ Git'e GİTMEZ

---

## 🎨 KULLANICI ARAYÜZÜ

### Ana Sayfa (Dashboard)
- **Hero Section:**
  - Doktor adı: "Op Dr. Hüseyin Sert"
  - Klinik adı: "Kadın Sağlığı Kliniği"
  - Analog saat (gerçek zamanlı)
  - Tarih: "DD.MM.YYYY GünAdı" (ör: "04.02.2026 Salı")
  - Yeşil "Yeni Hasta Ekle" butonu (#28a745)
  - Turuncu "Hasta Listesi" butonu (#ff9800)

- **Bugün Gelen Hastalar Tablosu:**
  - Hasta Kodu, Ad Soyad, Yaş
  - **Bir Önceki Ziyaret** (bugünden önceki son ziyaret tarihi)
  - İşlemler (Detay, Düzenle)

- **Kayıt Özeti:**
  - Toplam hasta sayısı
  - Bugün gelen hastalar
  - Son 7 günde muayene sayısı
  - En son eklenen hasta
  - Toplam muayene kaydı

### Hasta Listesi
- Filtreleme: Hasta kodu, ad soyad arama
- Sütunlar: Kod, Ad, Yaş, Doğum Tarihi, Son Ziyaret, Kayıt Tarihi, Muayene Sayısı
- Satır başına: Detay, Düzenle

### Hasta Detay Sayfası
- Temel bilgiler
- **Yeni Muayene Ekle** (accordion)
  - 8 alan: Tarih, Tür, SAT, Menstrüel Gün, Şikayet, USG, Teşhis, Tedavi
- **Muayene Geçmişi:**
  - Kronolojik sıra (en yeni üstte)
  - Her kayıtta: Ziyaret numarası, tarih, tüm bilgiler
  - Düzenle/Sil butonları

---

## 📊 ÖNEMLİ FONKSİYONLAR

### database.js

**listPatients(filters)**
- Optimized LEFT JOIN + GROUP BY (N+2 yerine 1 sorgu)
- Filtreleme: patient_code, full_name
- Döndürür: hasta listesi + muayene sayısı + son ziyaret

**listTodayPatients()**
- Bugün ziyareti olan hastalar
- **previous_visit** alanı: Bugünden önceki son ziyaret tarihi

**createPatient(data)**
- Benzersiz hasta kodu oluşturur: `YYYYMMDD-001`, `YYYYMMDD-002`, ...
- Tarih: o günkü tarih (localtime)

**createMedicalRecord(data)**
- visit_order otomatik hesaplanır (hasta için kaçıncı ziyaret)
- visit_week isteğe bağlı

**formatDate(dateString)**
- YYYY-MM-DD → DD.MM.YYYY
- Türkçe tarih gösterimi

**ensureDefaultUser()**
- APP_USER/APP_PASSWORD .env'den ZORUNLU
- Yoksa sistem ÇALIŞMAZ

### server.js

**GET /**
- Dashboard render
- currentMoment: "DD.MM.YYYY GünAdı" formatı
- todayPatients + stats

**GET /patients**
- Filtreleme desteği
- Pagination hazır (kullanılmıyor şu an)

**POST /patients/:id/records**
- Yeni muayene kaydı
- visit_order otomatik

**Oturum Yönetimi:**
- session-file-store: .sessions/ dizini
- TTL: 12 saat (43200 saniye)

---

## 🔄 YEDEKLEME SİSTEMİ

### CSV Export (scripts/export-csv.js)
**Çalıştırma:**
```bash
node scripts/export-csv.js manual    # Manuel yedek
node scripts/export-csv.js daily     # Günlük
node scripts/export-csv.js weekly    # Haftalık
```

**Hedef Klasörler:**
- `backups/manual/`
- `backups/daily/`
- `backups/weekly/`

**Dosya Formatı:**
- `hasta_kayitlari_YYYYMMDD_HHMMSS.csv`
- İçerik: Tüm hasta bilgileri + tüm muayene kayıtları (flatten)

### Otomatik Yedekleme (macOS LaunchAgent)
**Lokasyon:** `~/Library/LaunchAgents/com.clinic.backup.plist`

**Zamanlar:**
- **Günlük:** Her gün 02:00
- **Haftalık:** Pazartesi 03:00

---

## 📥 DOCX İÇE AKTARMA

### scripts/import-from-docx.js

**Kullanım:**
```bash
DOCX_PATH="/path/to/hasta.docx" node scripts/import-from-docx.js
```

**Nasıl Çalışır:**
1. mammoth.js ile DOCX'ten metin çıkarır
2. OpenAI GPT-4o-mini'ye gönderir
3. Türkçe tıbbi metni parse eder
4. JSON formatında hasta + muayene kayıtları döner
5. Veritabanına ekler

**Maliyet:** ~£0.0025 per file (GPT-4o-mini)

**Test Edildi:** 2 dosya, 24 kayıt (%100 başarı)

---

## 🚀 BAŞLATMA

### Manuel Başlatma
```bash
cd /Users/zaferyildirim/Desktop/huseyin_sert
node src/server.js
# Tarayıcıda: http://localhost:3000
```

### Masaüstü İkon ile Başlatma
**Dosya:** `start-server.command` (masaüstünde)

**İçerik:**
```bash
#!/bin/bash
PROJECT_DIR="/Users/zaferyildirim/Desktop/huseyin_sert"
pkill -f "node.*src/server.js" 2>/dev/null || true
sleep 1
cd "$PROJECT_DIR"
node src/server.js &
sleep 2
open http://localhost:3000
wait
```

**Çift tıkla → Sistem açılır!**

---

## 🛠️ KURULUM (Yeni Bilgisayar)

### Gereksinimler
- Node.js v18+ (önerilen: v25.4.0)
- macOS/Windows/Linux

### Adımlar
1. **Dosyaları Kopyala:**
   ```bash
   cp -r huseyin_sert /path/to/destination/
   ```

2. **NPM Paketlerini Yükle:**
   ```bash
   cd huseyin_sert
   npm install
   ```

3. **.env Dosyası Oluştur:**
   ```bash
   cp .env.example .env
   # .env'i düzenle - SESSION_SECRET, APP_USER, APP_PASSWORD ekle
   ```

4. **SESSION_SECRET Oluştur:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Sistemi Başlat:**
   ```bash
   node src/server.js
   # veya
   ./start-server.command
   ```

**İlk Giriş:**
- Kullanıcı: .env'deki APP_USER
- Şifre: .env'deki APP_PASSWORD

---

## 📝 ÖNEMLİ NOTLAR

### TC Kimlik
- ❌ **KALDIRILDI** - Sistem artık TC Kimlik kullanmıyor
- Hasta gizliliği için kaldırıldı

### Telefon Formatı
- ✅ **Serbest Format** - Her türlü telefon formatı kabul edilir
- Ör: 0555-123-45-67, +90 532 123 4567, (541) 222 11 00

### Tarih Formatı
- **Veritabanı:** YYYY-MM-DD (ISO 8601)
- **Gösterim:** DD.MM.YYYY (Türkçe)
- **Hafta Günü:** "Pazartesi, Salı, ..." (capitalize)

### Optimizasyonlar
1. **listPatients() Sorgusu:** N+2 → 1 sorgu (LEFT JOIN)
2. **Kalıcı Session:** Sunucu restart → oturumlar kaybolmaz
3. **DOCX Batch Import:** 700 dosya için hazır

---

## 🔧 GELİŞTİRME NOTLARI

### Güvenlik Audit Sonuçları (Tamamlandı)
✅ SESSION_SECRET hardcoded → .env'ye taşındı  
✅ APP_USER/PASSWORD hardcoded → .env'ye taşındı  
✅ MemoryStore → session-file-store (kalıcı)  
✅ N+2 sorgu → LEFT JOIN optimizasyonu  
✅ dotenv loading eksik → eklendi  

### UI İyileştirmeleri (Tamamlandı)
✅ TC Kimlik kolonu kaldırıldı  
✅ "Son Ziyaret" → "Bir Önceki Ziyaret"  
✅ Analog saat eklendi  
✅ Tarih formatı: "DD.MM.YYYY GünAdı"  
✅ Buton renkleri: Yeşil + Turuncu  
✅ Tüm Türkçe karakterler düzeltildi  

---

## 🎯 GELECEKTEKİ İYİLEŞTİRMELER

### Henüz Yapılmadı
- [ ] ~700 DOCX dosyasının toplu içe aktarımı (script hazır, kullanıcı onayı bekleniyor)
- [ ] CSV export'a usg ve menstrual_day kolonları eklenmesi
- [ ] Web-based raporlama sistemi (isteğe bağlı)
- [ ] Windows Task Scheduler kurulumu (ofis bilgisayarı için)

### Potansiyel Eklemeler
- [ ] PDF rapor oluşturma
- [ ] E-posta ile yedek gönderme
- [ ] Multi-user desteği (şu an tek kullanıcı)
- [ ] Randevu sistemi
- [ ] SMS entegrasyonu

---

## 📞 SİSTEM BİLGİLERİ

**Port:** 3000  
**Veritabanı:** SQLite (clinic.db)  
**Session Storage:** .sessions/  
**Log:** Konsol çıktısı  
**Encoding:** UTF-8 (Türkçe karakter desteği)  

**Versiyonlar:**
- Node.js: v25.4.0
- Express: 4.x
- sql.js: 1.x
- bcrypt: 5.x

---

## ⚠️ SORUN GİDERME

### "Cannot find module .env"
**Çözüm:** .env.example'ı kopyala → .env oluştur

### "SESSION_SECRET is required"
**Çözüm:** .env'e SESSION_SECRET ekle (64-char hex)

### Port 3000 kullanımda
**Çözüm:** 
```bash
pkill -f "node.*src/server.js"
```

### Oturumlar kaybolmuyor
**Çözüm:** .sessions/ klasörünü sil (veya TTL'yi değiştir)

### DOCX import hatası
**Çözüm:** .env'de OPENAI_API_KEY kontrolü

---

## 📄 LİSANS VE KULLANIM

**Lisans:** MIT (package.json'da belirtilmiş)  
**Kullanım:** Op Dr. Hüseyin Sert Kadın Sağlığı Kliniği için özel geliştirildi  
**Yazar:** Zafer Yıldırım (GitHub Copilot ile)  
**Tarih:** Şubat 2026

---

## 🔗 KAYNAKLAR

- Express.js: https://expressjs.com/
- sql.js: https://sql.js.org/
- bcrypt: https://github.com/kelektiv/node.bcrypt.js
- OpenAI API: https://platform.openai.com/docs

---

**SON GÜNCELLEME:** 4 Şubat 2026  
**DURUM:** ✅ Aktif Kullanımda, Production Ready
