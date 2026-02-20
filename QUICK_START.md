# 🚀 Hızlı Başlangıç Rehberi

## Uygulamayı Nasıl Başlatırım?

### ✨ EN KOLAY YOL (ÖNERİLEN)

**Masaüstünüzdeki `START_APP.command` dosyasına çift tıklayın!**

Bu kadar! Uygulama otomatik olarak:
- Server'ı başlatacak ✅
- Tarayıcıyı açacak ✅  
- Login sayfasına yönlendirecek ✅

### 📝 Giriş Bilgileri

```
Kullanıcı Adı: admin
Şifre: password
```

---

## ⚠️ Önemli Uyarılar

1. **Terminal penceresini KAPATMAYIN!**
   - Başlatıcı çalıştırdığınızda açılan Terminal penceresini kapatırsanız uygulama durur
   - Bu pencere arka planda çalışmalı

2. **Uygulamayı Durdurmak İçin**
   - Terminal penceresinde `Ctrl + C` tuşlarına basın
   - Veya Terminal penceresini kapatın

3. **Port Zaten Kullanımda Hatası**
   - Eğer "port 3000 kullanımda" hatası alırsanız:
   - Terminal'de şu komutu çalıştırın: `lsof -ti :3000 | xargs kill -9`
   - Sonra START_APP.command'ı tekrar çalıştırın

---

## 🔧 Alternatif Başlatma Yöntemleri

### Yöntem 1: Terminal ile

```bash
cd /Users/zaferyildirim/Desktop/huseyin_sert
npm start
```

Sonra tarayıcıda aç: http://localhost:3000

### Yöntem 2: Development Modu (Otomatik yenileme ile)

```bash
cd /Users/zaferyildirim/Desktop/huseyin_sert
npm run dev
```

---

## 🌐 Uygulama Adresi

Uygulama çalışırken şu adresten erişebilirsiniz:

**http://localhost:3000**

Herhangi bir tarayıcıda (Chrome, Safari, Firefox) bu adresi açın.

---

## 🆘 Sorun Giderme

### Server başlamıyor

1. Node.js kurulu mu kontrol edin:
```bash
node --version
```

2. Dependencies kurulu mu kontrol edin:
```bash
cd /Users/zaferyildirim/Desktop/huseyin_sert
npm install
```

3. Port 3000'i temizleyin:
```bash
lsof -ti :3000 | xargs kill -9
```

### Tarayıcı açılmıyor

- Manuel olarak açın: http://localhost:3000/login
- Safari, Chrome veya Firefox kullanabilirsiniz

### Database hatası

- Database otomatik oluşturulur: `~/Library/Application Support/Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi/clinic.db`
- Eğer sorun yaşarsanız, bu dosyayı silin ve uygulamayı yeniden başlatın

---

## 📂 Dosya Konumları

- **Uygulama**: `/Users/zaferyildirim/Desktop/huseyin_sert`
- **Database**: `~/Library/Application Support/Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi/clinic.db`
- **Sessions**: `~/Library/Application Support/Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi/.sessions`
- **Başlatıcı**: `~/Desktop/START_APP.command`

---

## 💡 İpuçları

1. **Uygulamayı her açtığınızda START_APP.command kullanın**
2. **Terminal penceresini minimize edin ama kapatmayın**
3. **Tarayıcı sekmesini kapatıp tekrar açabilirsiniz** (Server çalışmaya devam eder)
4. **Bilgisayarı kapatmadan önce Ctrl+C ile server'ı durdurun**

---

## 🎯 Neden Electron Değil?

Electron masaüstü uygulaması macOS ile uyumluluk sorunları yaşadığından, **web tabanlı yaklaşım** kullanıyoruz. Bu yaklaşım:

✅ Daha stabil
✅ Daha hızlı
✅ Daha az kaynak kullanır
✅ Tüm tarayıcılarda çalışır
✅ Uzaktan erişime açık (isteğe bağlı)

---

## 📞 Destek

Sorun yaşarsanız:
1. Terminal çıktısını kontrol edin
2. Browser console'u açın (F12 veya Cmd+Option+I)
3. Hata mesajlarını not edin
