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

⚠️ KRITIK: Her muayene kaydının hiç bir bilgisini atma - her satır, her bulgu, lab sonuçları, ilaçlar HEPSİ!

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
⚠️ DİKKAT: Her muayenenin TARİHİ yazılı olmayabilir - konteksten çıkar!
           SAT sadece ilk muayenede olabilir!
           Muayene bulguları satırını hemen sonrası yazılı olabilir!

HER ZİYARET İÇİN BUNU AL:

1. **Tarih** (TÜM SATIR KONTROL ET): 
   - "20.01.2025" yazılı mı? → "2025-01-20"
   - Yoksa muayene açıklamasından sonra mı yazılı? Konteksten çıkar
   - Tarih zorunlu!

2. **Muayene Türü** (visit_type): "Rutin Kontrol", "Sezaryan Sonu Kontrol" vb
   - Yazılı değilse "Kontrol" yaz3. **SAT** (Son Adet Tarihi): SADECE İLK MUAYENEDE var mı kontrol et!

4. **Adetin Günü**: "Adetin X. Günü" yazılı mı? Sayıyı çıkar, yoksa null

5. **Şikayet** (complaint): TÜM ŞIKAYETI - ATMA!
   - "Ellerde uyuşma ve odem olmuş" - tamamını yaz
   - "Kesinlikle eksik başı yok" - tamamını yaz
   - "Bir şikayeti yok" - yine yaz!
   - Şikayet yoksa "" (empty string)

6. **LAB/KLİNİK BULGULAR** (diagnosis'e yaz!):
   - "TİT de bakteri uri mevcut" yazılıysa MUTLAKA diagnosis'e yaz!
   - "Ellerde uyuşma ve odem" yazılıysa YAZ!
   - Tüm lab results, kultur sonuçları, klinik bulgular → diagnosis'e

7. **USG BULGULARI** (usg alanına): 
   - "USG: 30-1/7 haftalık" - TÜM İFADEYİ SAY
   - Sonraki satırda "FKA +. Amnion sıvısı normal..." yazılıysa → TAM YAZDIR
   - "TA: 1522 gr" yazılıysa → SAY
   - "Baş duruş", "Makat duruş" → SAY
   - TÜM STATİSTİK: "Gelişim yüzde 74 persantilde" → SAY!

8. **SONUÇ-TEDavi-REÇETE** (outcome'a): TAM HER ŞEY!
   - İnsizyon yeri temiz, pansuman → yaz
   - "Piyeloseptyl, magninore plus verildi" → ILAÇLAR outcome'a!
   - "Diyet önerildi" → yaz
   - "Önerilerde bulunuldu" → yaz
   - TÜM İLAÇLAR, TEDAVILER, ÖNERİLER → outcome'a DAHİL!

=== YAYGOIN PROBLEM VE ÇÖZÜMÜ ===
PROBLEM: "Ellerde uyuşma ve odem olmuş. TİT de bakteri uri mevcut."
ÇÖZÜM: İKİ BİLGİ DE AYRı ALANLARA YAZ:
  - complaint: "Ellerde uyuşma ve odem olmuş"
  - diagnosis: "TİT de bakteri uri mevcut" (veya her ikiside diagnosis'e)

SOROL: Her satırda birden fazla bilgi var mı?
CEVAP: Evet → HEPSINI YAZ! Sadece split et alanlar arasında!

=== ZİYARETLER SIRALAMASI ===
- EN ESKİ'DEN EN YENİ'YE (kronolojik sıra)
- Tarihler artışlı olmalı

=== KONTROL LİSTESİ (hiç atma!) ===
□ Complaint: Yok mu? "" yaz, var mı tamamını yaz
□ USG: Hafta sayısı + tüm bulguları yaz (13 haftalık, 30-1/7, FKA +, etc) 
□ Diagnosis: Lab/klinik bulgularını ekle (TİT, bakteri, kultur vb!)
□ Outcome: İlaçları ekle (Piyeloseptyl, Magninore, Decavit, Ecoprin vb)
□ Dates: YYYY-MM-DD format
□ NO MISSING: "TİT" ve "bakteri uri" HER İKİSİ YAZ!

=== JSON ÇIKTISI ===
{
  "patient": {
    "full_name": "Havva Didem Çercialioğlu",
    "birth_date": "1989-05-19",
    "age": 36,
    "phone_number": "+90 552 922 35 82",
    "chronic_conditions": [],
    "medications": ["Decavit", "Ecoprin", "Bekunis"],
    "allergies": [],
    "past_surgeries": []
  },
  "visits": [
    {
      "visit_date": "2025-01-20",
      "visit_type": "İlk Geliş",
      "last_menstrual_date": "2025-01-20",
      "menstrual_day": null,
      "complaint": "Gebelik. Şu an bir şikayeti yok.",  
      "usg": "13-2/7 haftalık. FKA +. Gross anomali izlenmedi.",
      "diagnosis": "Çift kese. Cin-kız.",
      "outcome": "NİFT test önerildi. Decavit, ecoprin verildi."
    },
    {
      "visit_date": "2025-08-12",
      "visit_type": "Kontrol",
      "last_menstrual_date": null,
      "menstrual_day": null,
      "complaint": "Ellerde uyuşma ve odem olmuş",
      "usg": "30-1/7 haftalık. FKA +. Amnion sıvısı normal alt sınır. TA: 1522 gr.",
      "diagnosis": "TİT de bakteri uri mevcut.",
      "outcome": "Piyeloseptyl, magninore plus verildi."
    }
  ]
}

=== ÖNEMLİ KURALLAR ===
- HER BİLGİ MUTLAKA YAZILACAK - 3 defa kontrol et!
- Boş campos: "" (empty string) veya null değil
- "Belirtilmemiş" yazıyorsa → "" (empty string)
- Yan yana yazılan bilgiler: "Ellerde uyuşma ve odem olmuş. TİT de bakteri uri mevcut." 
  → İKİSİ DE YAZ! Split et complaint/diagnosis alanlarına!
- Tarihleri hep YYYY-MM-DD yap
- Lab bulguları (TİT, bakteri, kultur) diagnosis'e YAZ!
- İlaçları outcome'a YAZ!

DOSYA İÇERİĞİ:
`;

async function parseWithAI(text, fileName) {
  console.log(`  🤖 AI ile parse ediliyor...`);
  console.log(`  🔑 API Key: ${process.env.OPENAI_API_KEY ? '✅ Var' : '❌ YOK'}`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Türkçe hasta dosyalarını JSON formatına çevirirsin. Sadece JSON döndür.' },
        { role: 'user', content: PROMPT + text }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    clearTimeout(timeoutId);
    const content = completion.choices[0].message.content;
    console.log(`  📝 AI output (ilk 200 char): ${content.substring(0, 200)}...`);
    
    try {
      const parsed = JSON.parse(content);
      console.log(`  ✅ ${parsed.visits?.length || 0} muayene kaydı bulundu`);
      return parsed;
    } catch (parseErr) {
      console.error(`  ❌ JSON parse hatası: ${parseErr.message}`);
      throw parseErr;
    }
  } catch (apiErr) {
    clearTimeout(timeoutId);
    console.error(`  ❌ OpenAI API Hatası: ${apiErr.message}`);
    console.error(`     Status: ${apiErr.status}`);
    console.error(`     Type: ${apiErr.constructor.name}`);
    if (apiErr.status === 401) console.error(`     → API Key geçersiz veya süresi dolmuş`);
    if (apiErr.status === 429) console.error(`     → Rate limit aşıldı, lütfen bekleyin`);
    if (apiErr.status === 500) console.error(`     → OpenAI API server hatası`);
    if (apiErr.code === 'ECONNREFUSED') console.error(`     → Ağa bağlanılamıyor`);
    throw apiErr;
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
