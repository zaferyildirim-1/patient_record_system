# 🏥 Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi

**Cross-platform desktop application** - Works on Mac and Windows  
Tek hekimli kadın doğum kliniği için geliştirilmiş hasta kayıt ve muayene takip sistemi.

## ✨ Özellikler
- 🖥️ **Masaüstü Uygulaması** - Electron ile çalışan native uygulama
- 👥 **Hasta Yönetimi** - Detaylı hasta profilleri ve otomatik hasta kodu
- 📋 **Muayene Kayıtları** - Tarih bazlı muayene takibi
- 🔍 **Hızlı Arama** - Hasta adı ve kodu ile anlık arama
- 💾 **SQLite Veritabanı** - Yerel, hızlı ve güvenli veri saklama
- 🤖 **AI Destekli Import** - Word dosyalarından otomatik veri çıkarma (GPT-4o-mini)
- 📊 **Dashboard** - Toplam hasta, muayene sayısı ve istatistikler
- 🔒 **Güvenli** - Oturum yönetimi ve şifreli giriş
- 🌐 **Çevrimdışı** - İnternet gerektirmez, tamamen local çalışır

## 📥 Kullanıcılar İçin

Sadece uygulamayı yükleyip çalıştırmak istiyorsanız:

👉 **[END_USER_INSTALLATION.md](END_USER_INSTALLATION.md)** - Kurulum talimatları (Türkçe)

### Hızlı Başlangıç:
1. `.dmg` (Mac) veya `.exe` (Windows) dosyasını indirin
2. Çift tıklayarak kurun
3. Uygulamayı başlatın
4. Giriş yapın (admin/password)

---

## 🛠️ Geliştiriciler İçin

Uygulamayı geliştirmek veya başka bilgisayara taşımak için:

### 📚 Tüm Dokümantasyon:
- 🗂️ **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Tüm dokümantasyon rehberi
- 🎯 **[WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)** - Görsel iş akışı kılavuzu
- 📦 **[BUILD_AND_DISTRIBUTION_GUIDE.md](BUILD_AND_DISTRIBUTION_GUIDE.md)** - Build ve dağıtım kılavuzu
- ⚡ **[QUICK_BUILD_REFERENCE.md](QUICK_BUILD_REFERENCE.md)** - Hızlı build komutları
- ✅ **[PRE_DISTRIBUTION_CHECKLIST.md](PRE_DISTRIBUTION_CHECKLIST.md)** - Dağıtım öncesi kontrol listesi
- 🚀 **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Geliştirici setup kılavuzu

## 🚀 Hızlı Başlangıç (Geliştirici)

### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/[your-repo]/patient_record_system.git
cd patient_record_system
```

### 2. Bağımlılıkları Kurun
```bash
npm install
```

### 3. Geliştirme Modunda Çalıştırın
```bash
npm run electron-dev
```

### 4. Production Build
```bash
# Mac için
npm run build-mac

# Windows için
npm run build-win
```

Detaylar için: [BUILD_AND_DISTRIBUTION_GUIDE.md](BUILD_AND_DISTRIBUTION_GUIDE.md)

## 📤 Başka Bilgisayarlara Kurulum

### Çok Basit! 3 Adım:

1. **Build yapın** (yukarıdaki komutları kullanın)
2. **`dist/` klasöründen installer dosyasını kopyalayın**
   - Mac: `Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi-1.0.0-arm64.dmg`
   - Windows: `Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi Setup 1.0.0.exe`
3. **Kullanıcıya gönderin** (USB, email, cloud storage)

### Kullanıcı Ne Yapacak?
- Installer'ı **çift tıklayıp** yükleyecek
- Uygulamayı açıp **giriş yapacak** (admin/password)
- Hemen kullanmaya başlayacak!

**Hiçbir ekstra kurulum gerekmez:**
- ✅ Node.js yüklemesi GEREKSIZ
- ✅ npm install GEREKSIZ
- ✅ .env dosyası GEREKSIZ (otomatik oluşur)
- ✅ İnternet bağlantısı GEREKSIZ
- ✅ Sadece çift tıklayın ve çalışır!

Detaylar: [END_USER_INSTALLATION.md](END_USER_INSTALLATION.md)

## 🏗️ Mimari

```
┌─────────────────────────────────────┐
│   Electron Desktop Application      │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   BrowserWindow (Renderer)   │  │
│  │      EJS Views + CSS         │  │
│  └──────────────────────────────┘  │
│              ↕                      │
│  ┌──────────────────────────────┐  │
│  │  Express Server (Port 3000)  │  │
│  │   - REST API Endpoints       │  │
│  │   - Session Management       │  │
│  │   - Authentication           │  │
│  └──────────────────────────────┘  │
│              ↕                      │
│  ┌──────────────────────────────┐  │
│  │   SQLite Database (local)    │  │
│  │   - Patients                 │  │
│  │   - Medical Records          │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Teknoloji Stack:
- **Frontend:** EJS templates, CSS, vanilla JavaScript
- **Backend:** Node.js + Express
- **Database:** SQLite (sql.js)
- **Desktop:** Electron 40.6.0
- **AI Integration:** OpenAI GPT-4o-mini (optional)

## 📁 Proje Yapısı

```
huseyin_sert/
├── main.js                 # Electron main process
├── preload.js              # Electron preload (security)
├── package.json            # Dependencies & build config
├── src/
│   ├── server.js           # Express web server
│   ├── database.js         # SQLite operations
│   └── ...
├── views/                  # EJS templates
│   ├── home.ejs
│   ├── patients/
│   └── partials/
├── public/                 # Static assets
│   ├── styles.css
│   └── ...
├── scripts/                # Utility scripts
│   ├── import-from-docx.js
│   └── export-csv.js
├── backups/                # Database backups
└── dist/                   # Built installers (after build)
```

## Kurulum & İLK ÇALIŞTIRMA

### 1. `.env` Dosyası Hazırlama
1. `.env.example` dosyasını kopyalayarak `.env` oluştur:
   ```bash
   cp .env.example .env
   ```

2. `.env` dosyasını düzenle ve aşağıdaki bilgileri kendi değerlerinizle değiştir:
   ```dotenv
   OPENAI_API_KEY=sk-your-key-here          # OpenAI API anahtarı (opsiyonel)
   SESSION_SECRET=your-64-char-hex-string   # Güvenlik anahtarı
   APP_USER=your-username                   # Admin kullanıcı adı
   APP_PASSWORD=your-strong-password        # Admin şifresi
   ```

### 2. SESSION_SECRET Oluşturma
Güçlü bir SESSION_SECRET oluştur:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Uygulamayı Başlat
```bash
npm start
```
Sistem, `.env` dosyasında tanımladığınız `APP_USER` ve `APP_PASSWORD` bilgileri ile hoşlanacaktır.

## Kullanım
1. Uygulamaya gir ve `.env` dosyasında belirttiğin kullanıcı adı/şifre ile oturum aç
2. Ana sayfadan "Yeni Hasta Ekle" ile temel bilgileri kaydedin
3. Hasta detay sayfasında muayene formunu kullanarak şikayet, tanı ve sonuç bilgilerini girin
4. Gerekirse muayene kayıtlarını silerek sadece ilgili ziyareti kaldırabilirsiniz

## GÜVENLİK ÖNEMLERİ

⚠️ **İLK BAŞLATMADA MUTLAKA:**
- [ ] `.env` dosyasında `APP_PASSWORD` KENDI güçlü şifreniz ile değiştirin
- [ ] `SESSION_SECRET` olarak rastgele bir 64-karakterlik string oluşturun
- [ ] OpenAI API anahtarı (DOCX import için) varsa `.env` dosyasında saklayın

⚠️ **Üretim (Production) için:**
- Tüm kimlik bilgileri `.env` dosyasında (Git repo'suna KOMIT EdİLMEYEN)
- Veritabanı yedekleri şifreli bir dizinde saklayın
- Şifreler düzenli olarak değiştiriniz
- HTTPS kullanarak bağlantıları şifreleyin

⚠️ **NE YAPMAYIN:**
- ❌ Şifreleri README'ye veya kod yorumlarına yazmayın
- ❌ API anahtarlarını repository'ye commit etmeyin
- ❌ Kişi adlarını test verisinde kullanmayın (KVKK ihlali)
- ❌ Hasta telefon numaralarını açık metin olarak saklamayın

## CSV Yedekleri
- Manuel yedek almak icin:
   ```bash
   npm run export:csv
   ```
- Komut, `backups/manual/` klasorunde tarih damgali iki dosya olusturur: `patients-*.csv` ve `medical-records-*.csv`.
- Bu dosyalari harici diske veya bulut klasorune kopyalayarak haftalik/gunluk arsiv olusturabilirsiniz.

### Otomatik Yedekleme (macOS LaunchAgent)
- Betik: [scripts/run-export.sh](scripts/run-export.sh) (daily/weekly arguman alir ve NVM ortamini yukler).
- plist dosyalari kullanici bazinda [~/Library/LaunchAgents/com.huseyinsert.backup.daily.plist](Library/LaunchAgents/com.huseyinsert.backup.daily.plist) ve [~/Library/LaunchAgents/com.huseyinsert.backup.weekly.plist](Library/LaunchAgents/com.huseyinsert.backup.weekly.plist).
- Ilk kurulum icin Terminal'de:
   ```bash
   launchctl load ~/Library/LaunchAgents/com.huseyinsert.backup.daily.plist
   launchctl load ~/Library/LaunchAgents/com.huseyinsert.backup.weekly.plist
   ```
- Gerekirse devre disi birakmak icin `launchctl unload` kullanabilirsiniz.
- Takvimler: her gun 23:59'da `backups/daily/`, her pazar 23:59'da `backups/weekly/` klasorune CSV kopyalar.

## Notlar
- Veritabani dosyasi `clinic.db` olarak proje kokunde tutulur.
- Yeni hasta ekleyip muayene bilgilerini ayri form ile girebilirsiniz; mevcut kayitlar korunur.
- Mevcut kayitlar icin eksik hasta kodlari otomatik tamamlanir ve kodlar tekrarlanamaz.
- Muayene kayitlari kalici olarak sira numarasi ve haftalik takip kodu ile saklanir.
- Giris yapan kullanici bilgisi tarayici kapatilana veya "Cikis" butonuna basana kadar aktif kalir.
- CSV yedegi calisirken uygulama acik olsa da veri dosyasi duyarlı sekilde sadece okunur; canli islemler etkilenmez.
