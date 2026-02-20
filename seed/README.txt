📦 SEED DATABASE

Bu klasöre Windows/Mac'te build almadan önce gerçek clinic.db dosyasını koyun:

    seed/clinic.db

Dosya .gitignore tarafından Git'e gönderilmez (hasta verisi koruması).

Build sonrası uygulama ilk açılışta bu DB'yi şuraya kopyalar:
- Mac: ~/Library/Application Support/ClinicApp/clinic.db
- Windows: %APPDATA%\ClinicApp\clinic.db

⚠️ ÖNEMLİ:
- Build öncesi seed/clinic.db olduğundan emin olun
- Gerçek hasta verisi varsa güvenli tutun
- Düzenli backup almayı unutmayın
