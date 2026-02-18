#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const OpenAI = require('openai');
const db = require('../src/database');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const PROMPT = `KADIN DOĞUM HASTASI DOSYASINI TAM OLARAK JSON'A ÇEVİR. HİÇBİR BİLGİ ATLANMAMALI!

=== HASTA BİLGİSİ (DOSYA BAŞINDA) ===
1. Ad Soyad: Zorunlu, tam adı bul
2. Doğum Tarihi: Bulabiliyor musun? YYYY-MM-DD biçim (bilmiyorsan null)
3. Yaşı: Doğum tarihinden hesapla (bugün: 18 Şubat 2026)
4. Telefon: Bulabiliyor musun? +90 ile başlayan format (bilmiyorsan null)
5. Kronik Hastalıklar: Dosyada genel bir hastalık tariflenmişse array, yoksa []
6. İlaçlar: SADECE HASTA AÇIKLAMALARINDA geçen ilaçlar (muayenelerdekiler değil) → array
7. Alerjiler: Belirtilmişse, yoksa []
8. Operasyonlar: Belirtilmişse (sezaryen, vs), yoksa []

=== MUAYENE KAYITLARı (ZİYARET LİSTESİ) ===
HER ZİYARET İÇİN BUNU AL:

1. **Tarih**: "20.01.2025" → "2025-01-20" 
2. **Muayene Türü** (visit_type): "Rutin Kontrol", "Sezaryan Sonu Kontrol" vb
3. **SAT** (Son Adet Tarihi): SADECE İLK MUAYENEDE var mı kontrol et! Sonrakilerde değil
4. **Adetin Günü**: "Adetin X. Günü" yazılı mı? Sayıyı çıkar, yoksa null
5. **Şikayet**: "Eller ve ayaklarda şişlik olmuş" - TÜM şikayeti yaz, kısma 
6. **USG**: "37 haftalık" veya "30-1/7 haftalık" - TÜM ifadeyi kopyala
7. **Teşhis**: "FKA +. Baş duruş." - TÜM teşhisi yaz, eksik bırakma
8. **Sonuç-Tedavi-Reçete**: "İnsizyon yeri temiz, pansuman yapıştı" - TAM YAZDIR
   - Bu kısımda ilaç, reçete, öneriler, tedavi HEPSI olabilir - HEPSİNİ OUTCOME'a yaz!

=== ZİYARETLER SIRALAMASI ===
- EN ESKİ'DEN EN YENİ'YE (kronolojik sıra)
- Tarihler artışlı olmalı

=== JSON ÇIKTISI ===
{
  "patient": {
    "full_name": "...",
    "birth_date": "YYYY-MM-DD veya null",
    "age": sayı,
    "phone_number": "+90 ... veya null",
    "chronic_conditions": [],
    "medications": [],
    "allergies": [],
    "past_surgeries": []
  },
  "visits": [
    {
      "visit_date": "YYYY-MM-DD",
      "visit_type": "Muayene Türü",
      "last_menstrual_date": "YYYY-MM-DD veya null (SADECE İLK İÇİN)",
      "menstrual_day": sayı veya null,
      "complaint": "TAM ŞIKAYET METNİ",  
      "usg": "TAM USG BİLGİSİ (hafta vs)",
      "diagnosis": "TAM TEŞHİS",
      "outcome": "TAM SONUÇ-TEDavi-REÇETE (ilaçlar burada!)"
    }
  ]
}

=== ÖNEMLİ ===
- Eğer bir alan belirtilmemiş → boş string "" (null değil)
- Eğer veri yoksa → [] (array) veya null
- HİÇBİR BİLGİ ATLANMAYACAK
- "Belirtilmemiş" yazıyorsa outcome/complaint = ""
- Tarihleri hep YYYY-MM-DD yap

DOSYA İÇERİĞİ:
`;

async function parseWithAI(text, fileName) {
  console.log(`  🤖 AI ile parse ediliyor...`);
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Türkçe hasta dosyalarını JSON formatına çevirirsin. Sadece JSON döndür.' },
      { role: 'user', content: PROMPT + text }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  });

  const content = completion.choices[0].message.content;
  console.log(`  📝 AI output (ilk 200 char): ${content.substring(0, 200)}...`);
  
  try {
    const parsed = JSON.parse(content);
    console.log(`  ✅ ${parsed.visits?.length || 0} muayene kaydı bulundu`);
    return parsed;
  } catch (parseErr) {
    console.error(`  ❌ JSON parse hatası: ${parseErr.message}`);
    console.error(`  Content: ${content.substring(0, 500)}`);
    throw parseErr;
  }
}

async function saveToDatabase(data) {
  try {
    if (!data.patient) {
      throw new Error('Patient data missing from parsed data');
    }

    const patient = db.createPatient({
      full_name: data.patient.full_name,
      age: data.patient.age,
      birth_date: data.patient.birth_date,
      phone_number: data.patient.phone_number,
      chronic_conditions: data.patient.chronic_conditions || [],
      medications: data.patient.medications || [],
      allergies: data.patient.allergies || [],
      past_surgeries: data.patient.past_surgeries || []
    });

    if (!patient || !patient.id) {
      throw new Error('Failed to create patient - no ID returned');
    }

    console.log(`  💾 Hasta kaydedildi: ${data.patient.full_name} (ID: ${patient.id})`);

    let count = 0;
    for (const visit of data.visits || []) {
      const visitDate = new Date(visit.visit_date);
      const year = visitDate.getFullYear();
      const weekNumber = getWeekNumber(visitDate);
      
      db.createMedicalRecord({
        patient_id: patient.id,
        visit_date: visit.visit_date,
        visit_order: count + 1,
        visit_type: visit.visit_type || 'Kontrol',
        visit_week: `${year}-W${String(weekNumber).padStart(2, '0')}`,
        last_menstrual_date: visit.last_menstrual_date || null,
        menstrual_day: visit.menstrual_day || null,
        complaint: visit.complaint || '',
        usg: visit.usg || '',
        diagnosis: visit.diagnosis || '',
        outcome: visit.outcome || ''
      });
      count++;
    }

    console.log(`  ✅ ${count} muayene kaydı eklendi\n`);
    return count;
  } catch (err) {
    console.error(`  ❌ Veritabanı hatası: ${err.message}`);
    throw err;
  }
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

async function processDocx(filePath) {
  const fileName = path.basename(filePath);
  console.log(`\n📄 ${fileName}`);

  try {
    const result = await mammoth.extractRawText({ path: filePath });
    const text = result.value;
    console.log(`  📖 ${text.length} karakter okundu`);

    const parsed = await parseWithAI(text, fileName);
    
    // AI output'unu yazdır (debug)
    console.log(`  📋 Parsed data:`, JSON.stringify(parsed, null, 2).substring(0, 300) + '...');
    
    const count = await saveToDatabase(parsed);

    return { success: true, fileName, patient: parsed.patient.full_name, count };
  } catch (error) {
    console.error(`  ❌ Hata: ${error.message}`);
    console.error(`  Stack: ${error.stack}`);
    return { success: false, fileName, error: error.message };
  }
}

async function main() {
  console.log('🏥 DOCX Import Aracı\n');
  console.log('='.repeat(50));

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'buraya-api-keyini-yaz') {
    console.error('\n❌ .env dosyasına OpenAI API key\'ini ekle!\n');
    process.exit(1);
  }

  await db.initializeDatabase();
  console.log('✅ Veritabanı hazır\n');

  // Test dosyası
  const testFile = '/Users/zaferyildirim/Desktop/Hasta Muayene dosyaları/Havva Didem Çercialioğlu.docx';
  
  if (!fs.existsSync(testFile)) {
    console.error(`❌ Dosya bulunamadı: ${testFile}`);
    process.exit(1);
  }

  console.log(`🧪 Test dosyası: ${path.basename(testFile)}`);
  console.log('='.repeat(50));

  const result = await processDocx(testFile);

  console.log('='.repeat(50));
  console.log('📊 SONUÇ\n');
  if (result.success) {
    console.log(`✅ Başarılı!`);
    console.log(`  Hasta: ${result.patient}`);
    console.log(`  Muayene: ${result.count} kayıt`);
  } else {
    console.log(`❌ Hata: ${result.error}`);
  }
  console.log('='.repeat(50));
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
