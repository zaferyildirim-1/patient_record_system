# Otomatik Yedekleme Kurulumu

## 📋 Dosyalar Oluşturuldu

- `com.clinic.backup.daily.plist` - Her gün saat 23:00'da çalışır
- `com.clinic.backup.weekly.plist` - Her Pazar 23:30'da çalışır

## 🚀 Kurulum Adımları

### 1. Log Klasörünü Oluştur

```bash
cd ~/Desktop/huseyin_sert
mkdir -p logs
```

### 2. Node.js Yolunu Kontrol Et

```bash
which node
```

Eğer `/usr/local/bin/node` değilse, plist dosyalarındaki yolu değiştir.

### 3. LaunchAgent'ları Kopyala

```bash
cd ~/Desktop/huseyin_sert
cp launchagents/*.plist ~/Library/LaunchAgents/
```

### 4. LaunchAgent'ları Yükle

```bash
# Günlük yedekleme
launchctl load ~/Library/LaunchAgents/com.clinic.backup.daily.plist

# Haftalık yedekleme
launchctl load ~/Library/LaunchAgents/com.clinic.backup.weekly.plist
```

### 5. Durumu Kontrol Et

```bash
# Yüklü mü kontrol et
launchctl list | grep clinic

# Hemen test et (günlük yedek)
launchctl start com.clinic.backup.daily

# Log'ları kontrol et
cat ~/Desktop/huseyin_sert/logs/backup-daily.log
cat ~/Desktop/huseyin_sert/logs/backup-daily-error.log
```

## 🔧 Yönetim Komutları

### Durdurma

```bash
launchctl unload ~/Library/LaunchAgents/com.clinic.backup.daily.plist
launchctl unload ~/Library/LaunchAgents/com.clinic.backup.weekly.plist
```

### Tekrar Başlatma

```bash
launchctl load ~/Library/LaunchAgents/com.clinic.backup.daily.plist
launchctl load ~/Library/LaunchAgents/com.clinic.backup.weekly.plist
```

### Manuel Çalıştırma

```bash
# Günlük yedek al
launchctl start com.clinic.backup.daily

# Haftalık yedek al
launchctl start com.clinic.backup.weekly
```

## 📁 Yedek Konumları

- Günlük: `~/Desktop/huseyin_sert/backups/daily/`
- Haftalık: `~/Desktop/huseyin_sert/backups/weekly/`
- Manuel: `~/Desktop/huseyin_sert/backups/manual/`

## ⏰ Zamanlama

- **Günlük**: Her gün saat 23:00
- **Haftalık**: Her Pazar saat 23:30
- Bilgisayar kapalıysa atlanır (bir sonraki zamanda çalışır)

## 🔍 Sorun Giderme

### LaunchAgent yüklenmiyor

```bash
# Dosya izinlerini kontrol et
ls -la ~/Library/LaunchAgents/com.clinic.backup.*

# Syntax kontrolü
plutil ~/Library/LaunchAgents/com.clinic.backup.daily.plist
```

### Node bulunamıyor hatası

```bash
# Node yolunu bul
which node

# Plist'teki yolu güncelle (örnek: /opt/homebrew/bin/node)
nano ~/Library/LaunchAgents/com.clinic.backup.daily.plist
```

### Log dosyası oluşmuyor

```bash
# Logs klasörü var mı?
ls -la ~/Desktop/huseyin_sert/logs/

# Manuel çalıştır ve hatayı gör
cd ~/Desktop/huseyin_sert
node scripts/export-csv.js daily
```
