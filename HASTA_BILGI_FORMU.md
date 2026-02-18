# 📋 Hasta Bilgi Formu - Alanlar & Örnekler

**Tarih:** 18 Şubat 2026  
**Klinik Tipi:** Kadın Doğum Kliniği

---

## 📝 HASTA KAYIT FORMU (İlk Ziyaret)

### Bölüm 1: Kişisel Bilgiler (TEMEL)

```
Ad Soyad: Ayşe Yılmaz
Yaş: 34
Doğum Tarihi: 15.05.1991
```

**Alanlar:**
| Alan | Örnek | Tip | Zorunlu |
|------|-------|-----|---------|
| Ad Soyad | Ayşe Yılmaz | Text | ✅ Evet |
| Yaş | 34 | Sayı (0-120) | ✅ Evet |
| Doğum Tarihi | 15.05.1991 | Tarih | ✅ Evet |
| Telefon | +90 532 XXX XXXX | Telefon | ✅ Evet |
| Email | ayse.yilmaz@email.com | Email | ❌ İsteğe |
| Adres | İstanbul, Kadıköy, Sokak No:5 | Text | ❌ İsteğe |

---

### Bölüm 2: Tıbbi Bilgiler (JINEKOLOJIK)

#### 2A. Menstrüel Durum
```
Son Adet Tarihi (SAT): 03.02.2026
Adet Siklus: 28 gün
Son Adet Süresi: 4-5 gün
```

**Alanlar:**
| Alan | Örnek | Not |
|------|-------|-----|
| Son Adet Tarihi | 03.02.2026 | En önemli parametrelerden biri |
| Adet Siklus | 28 gün | 21-35 gün normal |
| Adet Süresi | 5 | 3-7 gün normal |
| Adet Bolluğu | Normal / Ağır / Az | Dropdown |
| Menopoz Durumu | Premenopoz / Menopoz / Postmenopoz | İleri yaştaki hastalar |

#### 2B. Gebelik Geçmişi
```
Parity (G/P/Y/A): G3P2Y0 
(Toplam 3 hamilelik, 2 doğum, 0 abortuş)

Önceki Doğumlar:
  1. 2015, doğal yolla, kız, 3500g, normal seyretti
  2. 2018, sezaryen, erkek, 3800g, hipertansiyon nedeniyle
```

**Alanlar:**
| Alan | Örnek | Açıklama |
|------|-------|----------|
| G (Gravida) | 3 | Kaç defa hamile oldu |
| P (Para) | 2 | Kaç defa doğum yaptı |
| Y (Yaşayan) | 2 | Kaç çocuğu yaşıyor |
| A (Abortuş) | 0 | Kaç defa kaybetti |
| Önceki Doğum 1 | 2015, Doğal, Kız, 3500g | Her doğum için detay |
| Önceki Doğum 2 | 2018, Sezaryen, Erkek, 3800g | Komplikasyon varsa yaz |

#### 2C. Sağlık Öyküsü
```
Kan Grubu: O Rh+ (O pozitif)
Daha Önce Geçirdikleri Hastalıklar: Hipertansiyon
Cerrahi Operasyonlar: Appendektomi (2010)
```

**Alanlar:**
| Alan | Örnek | Not |
|------|-------|-----|
| Kan Grubu | A / B / AB / O (Rh +/-) | Kan transfüzyonu için önemli |
| Kronik Hastalıklar | Hipertansiyon, Diyabet | Çoklu seçim |
| Önceki Operasyonlar | Appendektomi 2010, Rahim ameliyatı 2015 | Sinyoloji önemli |
| İlaç Alerjileri | Penisiline karşı alerjik reaksiyon | ⚠️ Kritik! |
| Gıda Alerjileri | Fıstık, kestane | Bilgi amaçlı |

#### 2D. Güncel İlaçlar & Ek Bilgi
```
Kullanan İlaçlar:
  • Metoprol 100mg 1x/gün (yüksek tansiyon)
  • Aspirin 100mg 1x/gün (koruma)

Kontrasepsyon Geçmişi:
  • Şu anda: Hayır
  • Öncesinde: Doğum kontrol hapı (2018-2022)
  • Rahim içi araç: 5 yıl kullandı (çıkartıldı)
```

**Alanlar:**
| Alan | Örnek | Tip |
|------|-------|-----|
| Güncel İlaçlar | Metoprol, Aspirin | Text area (liste) |
| İlaç Dozları | 100mg 1x/gün | Doz ve sıklık |
| Kontrasepsyon Durumu | Hayır / Kullanıyor / Daha Öncesinde | Dropdown |
| Kontrasepsiyon Türü | Doğum hapı / RİA / Kondom | Text |
| Ruh Sağlığı Durumu | Normal | İsteğe (psikolojik durum) |

#### 2E. Sosyal Öyküsü (İsteğe bağlı)
```
Medeni Durum: Evli
Meslek: Öğretmen
Sigara/Alkol: Hayır / Sosyal olarak az
Son Cinsel Aktivite: 2 gün önce
```

---

## 🏥 MUAYENE KAYDI FORMU (Her Ziyaret)

### Bölüm 1: Temel Bilgiler

```
Muayene Tarihi: 18.02.2026
Muayene Türü: Kontrol Muayenesi
Ziyaret Sırası: 3. muayene
```

**Alanlar:**
| Alan | Örnek | Not |
|------|-------|-----|
| Muayene Tarihi | 18.02.2026 | Otomatik bugünün tarihi |
| Muayene Türü | İlk Muayene / Kontrol / Acil | Dropdown |
| Şikayeti | Hafif karın ağrısı, dönem öncesi rahatsızlık | Hasta kendi sözleriyle |

---

### Bölüm 2: Vital Signs (Sağlık İşaretleri)

```
Kan Basıncı: 120/80 mmHg
Nabız (Kalp Atışı): 72 bpm
Vücut Isısı: 36.8°C
Ağırlık: 62 kg
Boy: 165 cm
BMI: 22.8 (hesaplanır otomatik)
```

**Alanlar & Normal Değerler:**
| Alan | Normal | Örnek | Uyarı |
|------|--------|-------|-------|
| Sistolik BP | 90-120 | 120 | >140 = yüksek |
| Diyastolik BP | 60-80 | 80 | >90 = yüksek |
| Kalp Atışı | 60-100 | 72 | <60 = bradikardi |
| Solunum | 12-20 | 16 | >20 = takipne |
| Vücut Isısı | 36.5-37.5°C | 36.8 | >38 = ateş |
| Ağırlık | Önceki ile karşılaştır | 62 kg | Hamile değilse |
| Boy | Sabit | 165 cm | - |
| BMI | 18.5-24.9 | 22.8 | <18.5 zayıf, >30 obez |

---

### Bölüm 3: Jinekolojik Muayene

```
Son Adet Tarihi: 03.02.2026
Adetin Kaçıncı Günü: 15. gün

Şikayet: Hafif karın ağrısı, cinsel ilişkide ağrı

Muayene Bulgusu:
  • Genel durum: İyi, besili
  • Kalp-Akciğer: Normal
  • Karın: Yumuşak, distansiyon yok, organomegali yok
  • Pelvik Muayene:
    - Dış genitalya: Normal
    - Vajen: Normal sekresyon, enfeksyon yok
    - Serviks: Pembe, normal, patolojik sekresyon yok
    - Uterus: Normal boyut, mobil, hassasiyet yok
    - Adneksler: Normal, kitle yok
```

**Alanlar:**
| Muayene Noktası | Gözlemler | Örnek |
|-----------------|-----------|-------|
| Dış Genitalya | Normal / Irritasyon / Lezyon | Normal |
| Vajen | Sekresyon kalitesi | Net, temiz |
| Serviks | Görünüm | Pembe, normal |
| Uterus | Boyut, hareket, ağrı | Normal boyut, mobil |
| Adneksler (Yumurtalık) | Kitle, ağrı | Normal |
| Urat Testleri | Leukosit / Nitrit / Proteinüri | Negatif / Pozitif |

---

### Bölüm 4: Özel Testler (Gerekli olursa)

```
USG (Ultrason):
  • Uterus: 8 x 6 x 7 cm, miometrium homojen, endometrium 7 mm
  • Sağ Yumurtalık: 3.5 x 2.5 cm, follikül yok
  • Sol Yumurtalık: 3.2 x 2.3 cm, follikül yok
  • Liquid Free: Pelvik kavitede sıvı yok
  • Sonuç: Normal

Kan Tahlili (varsa):
  • Hb (Hemoglobin): 12.5 g/dL (normal: 12-16)
  • WBC: 7.5 K/μL (normal: 4.5-11)
  • PLT: 250 K/μL (normal: 150-400)
  • Glukoz: 95 mg/dL (normal açlık: <100)
```

**Alanlar:**
| Test | Sonuç | Normal Range | Açıklama |
|------|-------|--------------|----------|
| Hemoglobin | 12.5 | 12-16 | Kızıl kan hücresi |
| Beyaz Küre | 7.5 | 4.5-11 | Enfeksiyon kontrolü |
| Trombosit | 250 | 150-400 | Kanama riski |
| Glukoz | 95 | <100 (açlık) | Diyabet taraması |
| Kan Grubu | O Rh+ | - | Transfüzyon için |
| β-hCG | <5 | <5 | Gebelik testi (negatif) |
| HPV Sorgalaması | Negatif | - | Kanser riski taraması |

---

### Bölüm 5: Tanı & Tedavi Planı

```
Tanı: Dismenore (ağrılı adet), primer

İlaçlar Önerilen:
  • İbuprofen 400mg 3 kez günde (ağrı)
  • Magnezyum Sitrat 400mg 1x/gün (kasisiyete)

Yaşam Tarzı Önerileri:
  • Isı terapi (sıcak su torbası)
  • Düzenli egzersiz
  • Stres azaltma

Sonraki Ziyaret: 3 ay sonra
```

**Alanlar:**
| Alan | Örnek | Not |
|------|-------|-----|
| Teşhis | Dismenore (primer) | ICD-10 kodu varsa |
| Önerilen İlaç 1 | İbuprofen 400mg | Doz + Sıklık |
| Önerilen İlaç 2 | Magnezyum | Tamamlayıcı |
| Yaşam Tarzı | Sıcak yastık, egzersiz | Serbest metin |
| Yaşam Tarzı | Stres yönetimi | Serbest metin |
| Takip Tarihi | 3 ay sonra | Tarih veya gün sayısı |
| Uyarı Belirtileri | Kanama artarsa, ateş veya koku varsa | Acil başvuru koşulları |

---

## 📊 ÖRNEK SENARYOLAR

### Senaryo 1: İlk Rutin Kontrol (Genç Kadın)
```
Hasta: Yeni evli, 28 yaşında Fatma
Şikayet: Rutin jinekolojik muayene

Alınacak Bilgiler:
✅ Temel bilgiler (ad, yaş, telefon)
✅ SAT ve adet siklus
✅ Parity: G0P0Y0 (hiç hamile olmamış)
✅ Kan grubu
✅ İlaç alerjileri
✅ Kontrasepsyon istemi
✅ Vital signs
✅ USG (düşünülüyorsa)
```

### Senaryo 2: Hamilelik Takibi
```
Hasta: Gözde, 32 yaşında, 12 haftalık hamile
Şikayet: İlk trimester kontrol

Alınacak Bilgiler:
✅ Son menstrüel adet tarihi (LMP) = Gebelik yaşını hesapla
✅ Önceki doğum deneyimi (G/P)
✅ Hipertansiyon (gestasyonel diyabetes riski)
✅ Protein/şeker iddrar (gebelik komplikasyonları)
✅ Vital signs (kan basıncı önemli!)
✅ USG (gebelik yaşı, çok kişilik, fetal nabız)
✅ Triple screen markeri (Down sendromu taraması)
```

### Senaryo 3: Menopozal Şikayetler
```
Hasta: Yasemin, 51 yaşında
Şikayet: Sıcak basması, uyku sorunu, ruh değişikleri

Alınacak Bilgiler:
✅ Son adet tarihi + ne kadar süredir yok
✅ Şikayet süresi
✅ Yaşam kalitesi etkilenme derecesi
✅ Kostantırma geçmişi
✅ Kemik yoğunluğu riski (yaş, beslenme vb)
✅ Hormon replasman terapisi uygunluğu
✅ FSH/LH seviyeleri (menopoz tanısı)
```

### Senaryo 4: Kadın Sağlığı Sorunu (Enfeksiyon)
```
Hasta: Aynur, 35 yaşında
Şikayet: Sarı-yeşil sekresyon, kötü koku, ağrı

Alınacak Bilgiler:
✅ Şikayetin başlama tarihi
✅ İlişki durumu (cinsel ilişkiden sonra mı)
✅ Partner sayısı (STI riski)
✅ Sekresyon özellikleri (renk, konsistans, koku)
✅ Kaşıntı / yanma durumu
✅ Pelvik ağrı
✅ Son adet tarihi (farklı enfeksiyonlar)
✅ Pap smear geçmişi
✅ Vajen sürüntüsü testi
✅ Antibiyotik başlanmış mı
```

---

## 🎯 FORM TASARIMI (ÖNERİ)

### Sayfalaştırma (Step-by-Step)

**Sayfa 1: Temel Bilgiler**
- Ad, Yaş, Doğum Tarihi
- Telefon, Email, Adres
- Kan Grubu

**Sayfa 2: Jinekolojik Öyküsü**
- SAT, Adet Siklus
- G/P/Y/A (parity)
- Önceki Doğumlar

**Sayfa 3: Sağlık Öyküsü**
- Kronik Hastalıklar
- Cerrahi Operasyonlar
- İlaçlar & Alerjiler

**Sayfa 4: Kontrasepsyon & Sosyal**
- Güncel Kontrasepsyon
- Sigara/Alkol
- Meslek (opsiyonel)

### Muayene Zamanında

**Sayfa 1: Vital Signs**
- BP, Kalp Atışı
- Isı, Ağırlık
- BMI (otomatik hesap)

**Sayfa 2: Jinekolojik Muayene**
- Şikayet
- Muayene Bulguları (dropdown)
- Urat Tahlili

**Sayfa 3: Testler**
- USG Bulguları
- Kan Tahlili Sonuçları

**Sayfa 4: Tanı & Tedavi**
- Teşhis
- İlaç Reçetesi
- Öneriler
- Takip Tarihi

---

## 💾 DATABASE DEPOLAMA ÖRNEĞI

```json
{
  "patient": {
    "id": 1,
    "full_name": "Ayşe Yılmaz",
    "age": 34,
    "birth_date": "1991-05-15",
    "phone_number": "+90 532 XXX XXXX",
    "blood_type": "O",
    "rh_factor": "+",
    "parity": "G3P2Y2A0",
    "medications": ["Metoprol 100mg", "Aspirin 100mg"],
    "allergies": "Penisilin",
    "previous_conditions": ["Hipertansiyon"]
  },
  
  "medical_record": {
    "visit_date": "2026-02-18",
    "visit_type": "Kontrol Muayenesi",
    "last_menstrual_date": "2026-02-03",
    "menstrual_day": 15,
    
    "vital_signs": {
      "blood_pressure_systolic": 120,
      "blood_pressure_diastolic": 80,
      "heart_rate": 72,
      "body_temperature": 36.8,
      "weight": 62,
      "height": 165,
      "bmi": 22.8
    },
    
    "complaint": "Hafif karın ağrısı",
    "physical_examination": "Pelvik muayene normal",
    "usg": "Uterus normal, YO normal, sıvı yok",
    
    "diagnosis": "Dismenore (primer)",
    "medications_prescribed": [
      {"name": "İbuprofen", "dose": "400mg", "frequency": "3x/gün"}
    ],
    
    "follow_up_date": "2026-05-18",
    "follow_up_notes": "Ağrı devam ederse kontrol"
  }
}
```

---

## ✅ KONTROL LISTESI

Muayene sırasında sorulması gereken sorular:

- [ ] Son adet tarihi kaç gün önce?
- [ ] Adet siklus düzenli mi?
- [ ] Kaç hamileliği, kaç doğumu oldu?
- [ ] Kan basıncı ve nabzı normal mi?
- [ ] Ürinde protein/şeker var mı?
- [ ] Pap smear yaptırdı mı?
- [ ] Meme muayenesi gerekli mi?
- [ ] HPV aşısı yaptırdı mı?
- [ ] Kemik yoğunluğu taraması yapıldı mı?

---

**Son Güncelleme:** 18.02.2026  
**Hedef:** Kapsamlı ve sistematik hasta takibi

