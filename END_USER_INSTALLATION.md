# 🏥 Hasta Kayıt Sistemi - Kurulum Kılavuzu

**Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi**

Bilgisayar bilgisi gerektirmeyen, basit kurulum talimatları.

---

## 📥 Windows'ta Kurulum

### Adım 1: Dosyayı İndirin
Size gönderilen dosyayı indirin:
- **İsim:** `Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi Setup 1.0.0.exe`

### Adım 2: Kurulumu Başlatın
1. İndirilen dosyaya **çift tıklayın**
2. Windows güvenlik uyarısı çıkarsa: **"Yine de çalıştır"** veya **"Run anyway"** tıklayın
3. Kurulum sihirbazı açılır

### Adım 3: Kurulum Ayarları
1. **İleri** (Next) butonuna tıklayın
2. Kurulum konumu seçin (varsayılan ayarı kullanabilirsiniz)
3. **Kur** (Install) butonuna tıklayın
4. Kurulum tamamlanınca **Bitir** (Finish) tıklayın

### Adım 4: Uygulamayı Açın
- **Başlat Menüsü**'nden "Hasta Kayıt Sistemi" yazarak bulun
- Veya **masaüstündeki kısayol**a çift tıklayın

---

## 📥 macOS'ta Kurulum

### Adım 1: Dosyayı İndirin
Size gönderilen dosyayı indirin:
- **İsim:** `Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi-1.0.0.dmg`

### Adım 2: DMG Dosyasını Açın
1. İndirilen `.dmg` dosyasına **çift tıklayın**
2. Bir pencere açılır

### Adım 3: Uygulamayı Kopyalayın
1. **Uygulama simgesini** görürsünüz
2. Simgeyi **"Applications" klasörüne sürükleyin**
3. Kopyalama tamamlanınca pencereyi kapatabilirsiniz

### Adım 4: Uygulamayı Açın
- **Launchpad** veya **Applications** klasöründen uygulamayı bulun
- İlk açılışta macOS güvenlik uyarısı çıkarsa:
  1. **Tamam** deyin (uygulama kapanır)
  2. **Sistem Tercihleri** → **Güvenlik ve Gizlilik** → **Genel** sekmesine gidin
  3. **"Yine de Aç"** (Open Anyway) butonuna tıklayın
  4. Uygulamayı tekrar açın

---

## 🔐 İlk Giriş

Uygulama açıldığında giriş ekranı gelir:

**Varsayılan Kullanıcı Bilgileri:**
```
Kullanıcı Adı: admin
Şifre: password
```

⚠️ **ÖNEMLİ:** İlk girişten sonra şifrenizi değiştirin!

---

## 🖥️ Taşınabilir Sürüm (Windows - Kurulumuz)

Kurulum yapmak istemiyorsanız **taşınabilir sürümü** kullanabilirsiniz:

1. `Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi 1.0.0.exe` dosyasını indirin
2. İstediğiniz klasöre kopyalayın (örn: Masaüstü)
3. **Çift tıklayarak** çalıştırın
4. İstediğiniz zaman dosyayı silebilir veya başka bilgisayara kopyalayabilirsiniz

---

## 📂 Verileriniz Nerede?

Uygulamanın tüm verileri güvenli bir yerde saklanır:

### Windows:
```
C:\Users\[KullanıcıAdınız]\AppData\Local\Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi\
```

### macOS:
```
Kullanıcı/[AdSoyadınız]/Library/Application Support/Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi/
```

Bu klasörde:
- **clinic.db** - Tüm hasta kayıtlarınız
- **.sessions** klasörü - Oturum bilgileri

✅ Verileriniz yedeklenmek için bu klasörü kopyalayabilirsiniz

---

## ✨ Kullanım

### Ana Menü:
- **🏠 Anasayfa** - Özet ve istatistikler
- **👥 Hastalar** - Hasta listesi ve arama
- **➕ Yeni Hasta** - Yeni hasta kaydı oluşturma
- **👤 Hasta Detayı** - Hasta bilgileri ve muayene geçmişi

### Hasta Ekleme:
1. "Yeni Hasta" menüsüne tıklayın
2. Formu doldurun
3. "Kaydet" butonuna basın

### Muayene Kaydı:
1. Hasta detay sayfasına gidin
2. "Yeni Muayene Kaydı" butonuna tıklayın
3. Muayene bilgilerini girin
4. "Kaydet" butonuna basın

### Hasta Arama:
- Üst kısımdaki arama kutusuna hasta adı veya kodu yazın
- Sonuçlar anında görünür

---

## 🔄 Güncelleme

Yeni versiyon çıktığında:
1. Yeni kurulum dosyasını indirin
2. Normal kurulumu yapın (eski sürümün üzerine yazar)
3. **Verileriniz kaybolmaz** - Otomatik olarak korunur

---

## 🚨 Sorun Giderme

### "Uygulama açılmıyor"
- **Windows:** 
  - Antivirüs programını kontrol edin
  - Sağ tıklayıp "Yönetici olarak çalıştır" deneyin
- **Mac:** 
  - Güvenlik ayarlarından "Yine de Aç" deyin

### "Port 3000 kullanımda" hatası
- Uygulamanın başka bir kopyası açık olabilir
- Bilgisayarı yeniden başlatın

### "Giriş yapamıyorum"
- Kullanıcı adı: `admin`
- Şifre: `password`
- Büyük/küçük harf duyarlıdır

### "Verilerim kayboldu"
- Veriler otomatik olarak yukarıda belirtilen klasörlerde saklanır
- O klasörü kontrol edin

---

## 💾 Yedekleme (ÖNEMLİ!)

### Manuel Yedekleme:
1. Uygulamayı kapatın
2. Yukarıdaki veri klasörüne gidin
3. **clinic.db** dosyasını kopyalayın
4. Güvenli bir yere (USB, bulut vs) kaydedin

### Yedekleme Sıklığı:
- **Günlük çalışma:** Haftada 1 kez
- **Yoğun kullanım:** Günde 1 kez
- **Önemli işlemlerden önce:** Her zaman

---

## ❓ Yardım

Sorun yaşarsanız:
1. Bu kılavuzu tekrar okuyun
2. Uygulamayı yeniden başlatın
3. Bilgisayarı yeniden başlatın
4. Geliştirici ile iletişime geçin (hata mesajını gösterin)

---

## 🌐 İnternet Gerekli mi?

**HAYIR!** Uygulama tamamen çevrimdışı çalışır.
- İnternet bağlantısı gerekmez
- Tüm veriler yerel bilgisayarda saklanır
- Hızlı ve güvenli

---

## 📋 Sistem Gereksinimleri

### Minimum:
- **Windows:** Windows 10 veya üzeri
- **Mac:** macOS 10.14 (Mojave) veya üzeri
- **RAM:** 4 GB
- **Disk:** 500 MB boş alan

### Önerilen:
- **RAM:** 8 GB veya daha fazla
- **Disk:** 5 GB boş alan (büyük hasta kayıtları için)

---

**Güvenli kullanımlar! 🏥**

*Sürüm: 1.0.0*  
*Güncelleme: Şubat 2026*
