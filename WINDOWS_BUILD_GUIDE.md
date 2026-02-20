# Windows Build Guide

Windows'ta .exe dosyası oluşturmak için adım adım kılavuz.

## 📋 Ön Hazırlık

### Gereksinimler
- Node.js (v16 veya üzeri)
- Git
- npm (Node.js ile gelir)
- Windows 10 veya 11

## 🚀 Adım Adım Build Alma

### 1. Projeyi GitHub'dan İndir

```cmd
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd huseyin_sert
```

### 2. Bağımlılıkları Kur

```cmd
npm install
```

Bu komut `node_modules/` klasörünü oluşturur ve tüm gerekli kütüphaneleri indirir.

### 3A. Seed Database Ekle (Veritabanı ile Build)

Eğer .exe içinde hasta verilerinin de gitmesini istiyorsanız:

1. `seed` klasörü oluşturun (yoksa):
   ```cmd
   mkdir seed
   ```

2. Gerçek veritabanınızı `seed/clinic.db` olarak kopyalayın:
   ```cmd
   copy "C:\YourBackups\clinic.db" "seed\clinic.db"
   ```

   **Not:** `seed/clinic.db` Git'e gitmez (.gitignore tarafından korunur).

### 3B. Seed Database Olmadan (Boş Build)

Hiçbir şey yapmanıza gerek yok. `seed/` klasörü boş kalabilir.

### 4. Build Komutu Çalıştır

package.json içinde Windows için build script'i varsa:

```cmd
npm run build-windows
```

veya

```cmd
npm run dist
```

Eğer script yoksa, doğrudan electron-builder kullanın:

```cmd
npx electron-builder --windows --x64
```

### 5. Build Çıktısını Bul

Build tamamlandığında şu klasörde .exe dosyasını bulabilirsiniz:

```
dist\
  ├─ ClinicApp Setup 1.0.0.exe      (installer)
  └─ win-unpacked\                  (portable version)
      └─ ClinicApp.exe
```

## 🎯 Build Sonrası Kontrol

### Test Adımları

1. **Installer'ı Çalıştır:**
   ```cmd
   "dist\ClinicApp Setup 1.0.0.exe"
   ```

2. **Uygulamayı Aç:**
   - Kurulum sonrası masaüstünde veya başlat menüsünde kısayol oluşur.
   - Uygulamayı başlatın.

3. **Veritabanı Kontrolü:**
   - Uygulama açıldığında veritabanı şu konumda oluşur:
     ```
     %APPDATA%\ClinicApp\clinic.db
     ```
   - PowerShell'de kontrol:
     ```powershell
     Get-Item "$env:APPDATA\ClinicApp\clinic.db"
     ```

4. **Veri Kontrolü:**
   - Eğer seed DB eklediyseniz, hasta listesinde veriler görünmeli.
   - Boş build ise, yeni hasta ekleme ekranı açılmalı.

## 🔄 Veri Güvenliği

### Otomatik Backup

Uygulama şu durumlarda otomatik backup alır:

- Her gün ilk açılışta (günde 1 kez)
- Seed DB kopyalama öncesinde
- Bozuk DB tespit edildiğinde

Backuplar şurada saklanır:
```
%APPDATA%\ClinicApp\backups\
```

### Manuel Backup

Windows'ta manuel backup almak için PowerShell:

```powershell
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
Copy-Item "$env:APPDATA\ClinicApp\clinic.db" `
          "$env:APPDATA\ClinicApp\backups\clinic-manual-$timestamp.db"
```

## 📝 Önemli Notlar

### DB'siz Build
- Seed klasörü boşken build alırsanız, kullanıcı boş bir DB ile başlar.
- İlk açılışta admin kullanıcı ve şifre girişi gerekir.

### DB'li Build
- Seed DB eklerseniz, ilk açılışta tüm hastalar otomatik yüklenir.
- **Güvenlik:** Gerçek hasta verisi içeren .exe'yi güvenli kanaldan dağıtın.

### Single Instance
- Uygulama tek seferde bir kez açılabilir.
- İkinci açılış denemesi mevcut pencereye odaklanır.

### Veri Kaybı Koruması
- Uygulama hiçbir zaman veri içeren DB'nin üzerine yazmaz.
- Sadece boş veya bozuk DB tespit edilirse seed kopyalar.
- Her overwrite öncesi backup alınır.

## 🛠️ Sorun Giderme

### "Port 3000 kullanımda" Hatası

Başka bir Node.js/Express uygulaması 3000 portunu kullanıyor olabilir:

```cmd
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "Build failed" Hatası

1. `node_modules` ve `dist` klasörlerini silin:
   ```cmd
   rmdir /s /q node_modules dist
   ```

2. Tekrar kurun:
   ```cmd
   npm install
   npm run dist
   ```

### .exe Virüs Olarak İşaretlendi

Yeni .exe dosyaları bazen antivirüs tarafından şüpheli görülür (false positive):

1. .exe'yi Windows Defender'a exception olarak ekleyin.
2. Code signing sertifikası alarak imzalayın (profesyonel dağıtım için).

## 📦 Dağıtım

### USB veya Paylaşımlı Klasör

```
dist\ClinicApp Setup 1.0.0.exe  (sadece bu dosyayı paylaşın)
```

### Kurulum Talimatları (Son Kullanıcı)

1. .exe dosyasını çift tıklayın
2. Kurulum tamamlandığında uygulamayı başlatın
3. İlk giriş: admin / (belirtilen şifre)
4. Hastalar otomatik yüklenecektir (eğer seed DB varsa)

---

## ✅ Özet Checklist

- [ ] Git repo klonlandı
- [ ] `npm install` çalıştırıldı
- [ ] `seed/clinic.db` kopyalandı (opsiyonel)
- [ ] `npm run dist` çalıştırıldı
- [ ] `dist/` klasöründe .exe oluştu
- [ ] .exe test edildi
- [ ] Hasta verileri görünüyor (veya boş)
- [ ] Backup klasörü oluştu

Tebrikler! 🎉 Windows .exe build başarıyla tamamlandı.
