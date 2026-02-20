# Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi

Tek doktorlu klinik için hasta ve muayene kayıt yönetim sistemi.

## Özellikler

✅ Hasta profili yönetimi  
✅ Muayene kaydı ve tarihi  
✅ Sağlık bilgileri (kronik hastalık, ilaç, alerji, operasyon)  
✅ DOCX dosyalarından otomatik veri çıkarma (GPT-4o-mini)  
✅ Arama ve filtreleme  
✅ Masaüstü uygulaması (Electron)  

## Kurulum

### Mac/Linux - Geliştirme

```bash
# Depoyu klonla
git clone https://github.com/zaferyildirim-1/patient_record_system.git
cd patient_record_system

# Bağımlılıkları yükle
npm install

# .env dosyası oluştur
cp .env.example .env
# .env dosyasındaki tanımları doldur (OPENAI_API_KEY vs)

# Electron geliştirme modunda çalıştır
npm run electron-dev
```

### Windows - Kurulum

```bash
# Depoyu klonla
git clone https://github.com/zaferyildirim-1/patient_record_system.git
cd patient_record_system

# Bağımlılıkları yükle
npm install

# .env dosyası oluştur
copy .env.example .env
REM .env dosyasındaki tanımları doldur

# Windows .exe dosyasını oluştur
npm run build-win
```

.exe dosyası `dist/` klasöründe olacaktır.

## Veritabanı

SQLite kullanılır. `clinic.db` otomatik olarak oluşturulur.

## Lisans

MIT

## İletişim

Dr. Hüseyin Sert
