# 📊 Database Schema İyileştirmeleri

**Tarih:** 18 Şubat 2026  
**Sürüm:** 2.1 (Planned)  
**Durum:** ⏳ Yapılacak

---

## 📋 Mevcut Şema Özeti

### patients Tablosu
```
id                  INTEGER PRIMARY KEY
patient_code        TEXT UNIQUE
full_name          TEXT
age                INTEGER
birth_date         TEXT
phone_number       TEXT
created_at         TIMESTAMP
updated_at         TIMESTAMP
```

### medical_records Tablosu
```
id                  INTEGER PRIMARY KEY
patient_id         INTEGER (Foreign Key)
visit_date         TEXT
visit_order        INTEGER
visit_type         TEXT
visit_week         TEXT
last_menstrual_date TEXT
menstrual_day      TEXT
complaint          TEXT
usg               TEXT
diagnosis         TEXT
outcome           TEXT
created_at         TIMESTAMP
updated_at         TIMESTAMP
```

**⚠️ NOTLAR:**
- **Kronik Hastalık, İlaç, Alerji, Operasyon** → `patients` tablosunda depolanır (hastanın kayıt bilgisiylen ilişkilidir)
- **Muayene Sırasında** bu bilgiler **read-only** olarak gösterilir, doktor üzerine yeni bilgi ekleyebilir
- `additional_chronic_conditions`, `additional_medications`, `additional_allergies`, `additional_surgeries` → opsiyonel olarak `outcome` veya ayrı notlar alanında yazılır

---

## 🔧 Eklenecek Alanlar (Vitals & Health)

### patients Tablosuna Eklenecek

```sql
ALTER TABLE patients ADD COLUMN (
  email TEXT,                        -- İletişim için
  address TEXT,                      -- Hasta adresi
  blood_type TEXT,                   -- Kan grubu (A, B, AB, O)
  marital_status TEXT,               -- Medeni durum (evli/bekar/vs)
  occupation TEXT,                   -- Meslek/iş
  emergency_contact_name TEXT,       -- Acil durum kişi adı
  emergency_contact_phone TEXT       -- Acil durum telefonu
);
```

### medical_records Tablosuna Eklenecek

#### Vital Signs (Sağlık İşaretleri)
```sql
ALTER TABLE medical_records ADD COLUMN (
  -- Kan Basıncı
  blood_pressure_systolic INTEGER,     -- Sistolik (mmHg)
  blood_pressure_diastolic INTEGER,    -- Diyastolik (mmHg)
  
  -- Kalp & Solunum
  heart_rate INTEGER,                  -- Kalp atışı (bpm)
  respiratory_rate INTEGER,            -- Solunum sayısı (/min)
  
  -- Vücut Ölçümleri
  body_temperature REAL,               -- Vücut ısısı (°C)
  weight REAL,                         -- Ağırlık (kg)
  height REAL,                         -- Boy (cm)
  bmi REAL                             -- BMI (hesaplanan)
);
```

#### Tıbbi Tarih & İlaçlar
```sql
ALTER TABLE medical_records ADD COLUMN (
  medications JSON,                   -- İlaç listesi
  -- [{"name": "İlaç1", "dose": "500mg", "frequency": "2x/gün"}]
  
  allergies TEXT,                     -- Alerji bilgileri
  contraindications TEXT,             -- Kontrendikasyonlar
  previous_conditions TEXT            -- Geçmiş hastalıklar
);
```

#### Muayene Detayları
```sql
ALTER TABLE medical_records ADD COLUMN (
  -- Fizik Muayene
  physical_examination TEXT,          -- Detaylı muayene notları
  lab_results TEXT,                   -- Lab test sonuçları
  
  -- Takip
  follow_up_required BOOLEAN,         -- Takip gerekli mi?
  follow_up_date DATE,                -- Takip tarihi
  follow_up_notes TEXT                -- Takip notları
);
```

---

## 🔐 KVKK Uyumu - Audit Trail

### audit_logs Tablosu (Yeni)

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action VARCHAR(50),              -- CREATE, UPDATE, DELETE, VIEW
  table_name VARCHAR(50),          -- patients, medical_records
  record_id INTEGER,               -- Hangi hastaya/muayeneye ait
  user_id INTEGER,                 -- Kim yaptı
  
  old_data JSON,                   -- Önceki değerler (update için)
  new_data JSON,                   -- Yeni değerler
  
  changes TEXT,                    -- Hangi alanlar değişti
  ip_address TEXT,                 -- Kimin IP'sinden
  timestamp TIMESTAMP DEFAULT (datetime('now')),
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### patients & medical_records'a Eklenecek Audit Alanları

```sql
-- Her tabloya ekle:
ALTER TABLE patients ADD COLUMN (
  created_by_user_id INTEGER,      -- Kimin oluşturduğu
  updated_by_user_id INTEGER,      -- Son değiştirenler kişi
  FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  FOREIGN KEY (updated_by_user_id) REFERENCES users(id)
);

-- Aynı şekilde medical_records'a da:
ALTER TABLE medical_records ADD COLUMN (
  created_by_user_id INTEGER,
  updated_by_user_id INTEGER,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id),
  FOREIGN KEY (updated_by_user_id) REFERENCES users(id)
);
```

---

## 📁 Dosya & Attachment Sistemi (Gelecek)

### attachments Tablosu (Opsiyonel)

```sql
CREATE TABLE IF NOT EXISTS attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  record_id INTEGER,               -- Hangi muayeneye ait
  
  file_name TEXT NOT NULL,         -- dosya adı
  file_path TEXT NOT NULL,         -- disk'te nereye kaydedildi
  file_type TEXT,                  -- application/pdf, image/jpeg vb
  file_size INTEGER,               -- Byte cinsinden
  
  uploaded_by_user_id INTEGER,
  created_at TIMESTAMP DEFAULT (datetime('now')),
  
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id)
);
```

**Dosya tiplerine örnekler:**
- Ultrason raporları (PDF)
- Kan tahlili sonuçları (PDF, Image)
- Reçete fotoğrafları (JPG, PNG)
- Röntgen görüntüleri (DICOM, JPG)

---

## 🎯 İmplementasyon Planı

### Faz 1: Temel Vital Signs (Bu Hafta)
- [x] Tasarla
- [ ] Database alter-table komutlarını yaz
- [ ] Validation kurallarını ekle
- [ ] Form alanlarını güncelle
- [ ] Test et

### Faz 2: KVKK Audit Trail (Sonraki Hafta)
- [ ] audit_logs tablosu oluştur
- [ ] Database.js'e logging fonksiyonu ekle
- [ ] Her işlemi loga kaydet
- [ ] Admin paneli için audit reports

### Faz 3: Dosya Yönetimi (2 Hafta Sonra)
- [ ] attachments tablosu
- [ ] File upload/download API
- [ ] Virtual storage (cloud integrasyonu opsiyonel)

---

## 🔄 Backward Compatibility

Eski veritabanlarla uyumluluğu sağlamak için:

```javascript
// database.js'de migration mantığı
async function migrateSchema() {
  // Eğer alanlar yoksa ekle
  const missingFields = [
    'blood_type',
    'heart_rate',
    'body_temperature',
    // ... diğerleri
  ];
  
  for (const field of missingFields) {
    try {
      db.run(`ALTER TABLE medical_records ADD COLUMN ${field} ...`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        // Zaten var, geç
      } else {
        throw err;
      }
    }
  }
}

// App başlangıcında çalıştır
app.get('/health', async (req, res) => {
  await migrateSchema();
  res.json({ status: 'ok' });
});
```

---

## 📝 Form Güncellemeleri

### Hasta Formu (views/patients/form.ejs)

**Eklenecek Alanlar:**
- [ ] Email
- [ ] Adres
- [ ] Kan Grubu (dropdown: A, B, AB, O)
- [ ] Medeni Durum
- [ ] Acil Durum Kişi (ad + telefon)

### Muayene Formu (views/patients/record-edit.ejs)

**Eklenecek Bölümler:**

#### Vital Signs Kartı
```html
<section class="vitals">
  <h3>Vital Signs</h3>
  <div class="grid">
    <input type="number" name="blood_pressure_systolic" placeholder="Sistolik (mmHg)" min="80" max="200" />
    <input type="number" name="blood_pressure_diastolic" placeholder="Diyastolik (mmHg)" min="40" max="130" />
    <input type="number" name="heart_rate" placeholder="Kalp Atışı (bpm)" min="40" max="200" />
    <input type="number" name="body_temperature" step="0.1" placeholder="Vücut Isısı (°C)" min="35" max="42" />
    <input type="number" name="weight" step="0.1" placeholder="Ağırlık (kg)" min="20" max="300" />
    <input type="number" name="height" placeholder="Boy (cm)" min="100" max="220" />
  </div>
</section>
```

#### İlaçlar & Alerji
```html
<section class="medications">
  <h3>İlaçlar & Alerji</h3>
  <textarea name="medications" placeholder="Güncel ilaçlar listesi&#10;(İlaç adı, doz, frekans)"></textarea>
  <textarea name="allergies" placeholder="Bilinen alerji/kontrendikasyonlar"></textarea>
</section>
```

---

## 📊 Örnek Veri

```javascript
// POST /patients/:id/records
{
  visit_date: '2026-02-18',
  visit_type: 'Kontrol Muayenesi',
  
  // Vital Signs
  blood_pressure_systolic: 120,
  blood_pressure_diastolic: 80,
  heart_rate: 72,
  body_temperature: 36.8,
  weight: 62.5,
  height: 165.0,
  
  // Şikayet & Muayene
  complaint: 'Rutin kontrol',
  physical_examination: 'Muayene bulguları normal',
  
  // İlaçlar & Alerji
  medications: '[{"name":"İlaç A","dose":"500mg","frequency":"2x/gün"}]',
  allergies: 'Penisiline karşı alerjik yanıt',
  
  // Tanı & Sonuç
  diagnosis: 'Sağlıklı durum',
  outcome: '6 ay sonra tekrar kontrol',
  
  // Takip
  follow_up_required: false,
  follow_up_date: null
}
```

---

## ✅ Validation Kuralları

| Alan | Rule | Örnek |
|------|------|-------|
| age | 0-150 | 45 |
| blood_type | A\|B\|AB\|O | AB |
| heart_rate | 40-200 | 72 |
| blood_pressure_systolic | 80-200 | 120 |
| blood_pressure_diastolic | 40-130 | 80 |
| body_temperature | 35-42 | 36.8 |
| weight | 20-300 | 62.5 |
| height | 100-220 | 165 |
| email | RFC 5322 | user@example.com |

---

## 🚀 Sonraki Adımlar

1. **Bu hafta:** Vital signs formlarını ekle
2. **Sonraki hafta:** KVKK audit logging
3. **2 hafta sonra:** Dosya yönetimi

Windows'a taşımadan önce tüm testleri local'de yap!

---

**Son Güncellenme:** 18.02.2026
