# 🏥 Masaüstü Uygulaması Kurulum Talimatı

## ✅ HAZIR: Çift Tıklanabilir Script

**start-server.command** dosyası hazır!

### Nasıl Kullanılır:
1. **Finder'da** `start-server.command` dosyasını bulun
2. **Çift tıklayın** → Terminal açılır ve server başlar
3. **Tarayıcı otomatik açılır** (http://localhost:3000)
4. Çalışmaya devam eder

### Durdurmak İçin:
- Terminal penceresinde **Ctrl+C** veya pencereyi kapatın

---

## 🎨 Masaüstüne İkon Ekleme (İsteğe Bağlı)

### Yöntem 1: Automator ile .app Oluşturma (ÖNERİLEN)

1. **Automator**'ı açın (Applications > Automator)
2. **Application** seçin → Choose
3. Sol taraftan **"Run Shell Script"** sürükleyin
4. Script kutusuna şunu yapıştırın:
   ```bash
   cd /Users/zaferyildirim/Desktop/huseyin_sert
   ./start-server.command
   ```
5. **File > Save** → "Hasta Kayıt Sistemi" adıyla masaüstüne kaydedin
6. **İkon Değiştirme**:
   - Herhangi bir tıbbi ikon PNG/ICNS bulun (🏥 veya + işareti)
   - Uygulamaya **sağ tık > Get Info**
   - Sol üstteki küçük ikona tıklayın
   - **Cmd+V** ile yeni ikonu yapıştırın

### Yöntem 2: Mevcut Script'i Masaüstüne Kopyala

```bash
cp /Users/zaferyildirim/Desktop/huseyin_sert/start-server.command ~/Desktop/
```

Ardından ikon eklemek için:
- start-server.command'a **sağ tık > Get Info**
- Küçük ikona tıklayıp istediğiniz görseli yapıştırın

---

## 🚀 Kullanım

**Masaüstünden çift tıklayın → Sistem hazır!**

Terminal penceresi açık kaldığı sürece sistem çalışır.
