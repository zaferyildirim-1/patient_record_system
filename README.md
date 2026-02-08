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

## Kullanim
1. Oturum acmak icin kullanici adi `huseyinsert` ve sifre `huseyinsert213` bilgilerini girin.
2. Ana sayfadan "Yeni Hasta Ekle" ile temel bilgileri kaydedin.
3. Hasta detay sayfasinda muayene formunu kullanarak sikayet, teshis ve sonuc bilgilerini girin.
4. Gerekirse muayene kayitlarini silerek sadece ilgili ziyareti kaldirabilirsiniz.

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
