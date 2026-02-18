# Hasta Kayit Sistemi

Tek hekimli kadin dogum klinigi icin gelistirilen basit hasta kayit web uygulamasi. Express tabanli sunucu, EJS sablonlari ve dosya tabanli SQLite (sql.js) veritabani kullanir.

## Ozellikler
- Ana sayfa panosu ile toplam hasta, muayene sayisi ve son ziyaret ozetleri
- Her hasta icin temel bilgiler (TC kimlik, ad soyad, yas, ilk gelis tarihi)
- Her hasta icin otomatik olusturulan benzersiz hasta kodu (YYYYMMDD-### formatinda)
- Muayene kayitlarini ayri ekleme, listeleme ve silme imkani
- Her muayeneyi tarih ve sira numarasi ile kaydedip takip edebilme
- Her kontrol için haftalik takip (YYYY-W##) bilgisinin otomatik islenmesi
- Kayit silme durumunda veritabani dosyasinin otomatik guncellenmesi
- Sade arayuz, masaustu tarayici uzerinden erisim

## Kurulum
1. Proje dizinine gecin:
   ```bash
   cd /Users/zaferyildirim/Desktop/huseyin_sert
   ```
2. Bagimliliklari kurun:
   ```bash
   npm install
   ```

## Gelistirme
- Sunucuyu baslatmak icin:
  ```bash
  npm start
  ```
- Varsayilan adres: http://localhost:3000

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
