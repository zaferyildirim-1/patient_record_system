require('dotenv').config();
const mammoth = require('mammoth');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const database = require('../src/database');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 5 seçilmiş dosya
const FILES_TO_IMPORT = [
  'Funda Şengil .docx',
  'Hilal Alarcin .docx',
  'Merve Yılmaz .docx',
  'Funda Kusac .docx',
  'Fatma Şahin .docx'
];

const DOCX_FOLDER = '/Users/zaferyildirim/Desktop/Hasta Muayene dosyaları';

const SYSTEM_PROMPT = `Sen tıbbi bir uzman asistanısın. Kadın doğum kliniği hasta dosyasından bilgi çıkaracaksın.

TIBBİ KISALTMALAR VE JARGON:
- G#P#Y#: Gravida/Parite/Yaşayan (örn: G3P2Y2)
- ##-#/7 hf, ## hafta: Gebelik haftası (örn: 32-2/7 hf)
- SAT/LMP: Son Adet Tarihi
- NST, CTG, BPD, FL, AC gibi terimleri tanı
- BU TERİMLERİ ASLA ATLAMA - olduğu gibi kaydet!

ÖNEMLİ KURALLAR:
1. Metindeki TÜM bilgileri kaydet - ASLA BİR ŞEY KAYBETME
2. Her bilgiyi EN UYGUN alana yerleştir (sen karar ver)
3. Tarihler önemli - hangi bilgi hangi muayeneye ait, sen anla
4. Tıbbi kısaltmaları tanı ve doğru yere koy:
   - Gebelik haftası → visit_week
   - G#P#Y# → diagnosis veya complaint (hangi bağlamda yazıldıysa)
5. Emin olmadığın terimleri AYNEN yaz, yorumlama!
6. Eksik olmasın - fazla bilgi vermeyi tercih et

ALAN TANIMLARI (esnek):
- complaint: Şikayet, hikaye, semptom, aile hikayesi, obstetrik hikaye (G#P#Y#)
- usg: USG, doppler, NST, CTG, lab, test, sayısal ölçümler (BPD, FL, AC...)
- diagnosis: Muayene bulguları, değerlendirme, teşhis, doktor gözlemi
- outcome: Tedavi, reçete, ilaç, öneri, plan, takip, diğer notlar
- visit_week: "32. hafta", "32-2/7 hf" gibi gebelik haftası bilgisi

JSON formatında döndür:
{
  "patient": {
    "full_name": "Ad Soyad",
    "age": 30,
    "birth_date": "YYYY-MM-DD" (varsa),
    "phone_number": "telefon" (varsa)
  },
  "records": [
    {
      "visit_date": "YYYY-MM-DD",
      "visit_order": 1,
      "visit_week": "32-2/7 hf" veya "32. hafta" (varsa),
      "visit_type": "Kontrol/İlk Muayene" (sen belirle),
      "complaint": "...",
      "last_menstrual_date": "YYYY-MM-DD" (SAT varsa),
      "menstrual_day": "3" (varsa),
      "usg": "...",
      "diagnosis": "...",
      "outcome": "..."
    }
  ]
}

⚠️ ZORUNLU: visit_order mutlaka olmalı (kaçıncı ziyaret). Tahmin et veya 1 yap.`;

async function extractTextFromDocx(docxPath) {
  try {
    const result = await mammoth.extractRawText({ path: docxPath });
    return result.value;
  } catch (error) {
    throw new Error(`DOCX okuma hatası: ${error.message}`);
  }
}

async function parseWithOpenAI(text, filename) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Dosya adı: ${filename}\n\n${text}` }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content);
}

async function importFile(filename) {
  const filePath = path.join(DOCX_FOLDER, filename);
  
  console.log(`\n📄 [${filename}] İşleniyor...`);
  
  // 1. DOCX'ten metin çıkar
  const text = await extractTextFromDocx(filePath);
  console.log(`   📏 Metin uzunluğu: ${text.length} karakter`);
  
  // 2. OpenAI ile parse et
  const parsed = await parseWithOpenAI(text, filename);
  
  // 3. Hasta var mı kontrol et
  const patientData = parsed.patient;
  if (!patientData || !patientData.full_name || !patientData.age) {
    throw new Error('Hasta bilgileri eksik (ad veya yaş yok)');
  }
  
  const existingPatients = database.listPatients({ full_name: patientData.full_name });
  let patientId;
  let isNew = false;
  
  if (existingPatients.length > 0) {
    // Hasta mevcut
    patientId = existingPatients[0].id;
    console.log(`   ⚠️  Hasta mevcut: ${patientData.full_name} (${existingPatients[0].patient_code})`);
  } else {
    // Yeni hasta
    patientId = database.createPatient({
      full_name: patientData.full_name,
      age: patientData.age,
      birth_date: patientData.birth_date || null,
      phone_number: patientData.phone_number || null
    });
    isNew = true;
    const patient = database.getPatient(patientId);
    console.log(`   ✅ Yeni hasta: ${patientData.full_name} (${patient.patient_code})`);
  }
  
  // 4. Muayene kayıtlarını ekle
  const records = parsed.records || [];
  let addedRecords = 0;
  
  for (const record of records) {
    if (!record.visit_date) continue;
    
    database.createMedicalRecord({
      patient_id: patientId,
      visit_date: record.visit_date,
      visit_order: record.visit_order || 1,
      visit_week: record.visit_week || null,
      visit_type: record.visit_type || null,
      complaint: record.complaint || null,
      last_menstrual_date: record.last_menstrual_date || null,
      menstrual_day: record.menstrual_day || null,
      usg: record.usg || null,
      diagnosis: record.diagnosis || null,
      outcome: record.outcome || null
    });
    addedRecords++;
  }
  
  console.log(`   ✅ ${addedRecords} muayene kaydı eklendi`);
  
  // 5. Bilgi kaybı kontrolü
  const jsonLength = JSON.stringify(parsed).length;
  const lossRate = ((text.length - jsonLength) / text.length * 100).toFixed(1);
  console.log(`   📊 Kayıp oranı: ~${lossRate}% (${text.length} → ${jsonLength} karakter)`);
  
  if (parseFloat(lossRate) > 50) {
    console.log(`   ⚠️  UYARI: Yüksek kayıp oranı! Manuel kontrol gerekebilir.`);
  }
  
  return { isNew, recordsAdded: addedRecords };
}

async function main() {
  console.log('🏥 DOCX Toplu İçe Aktarma Başladı');
  console.log('📁 Klasör:', DOCX_FOLDER);
  console.log('📋 Dosya sayısı:', FILES_TO_IMPORT.length);
  console.log('');
  
  await database.init();
  
  const stats = {
    processed: 0,
    newPatients: 0,
    updatedPatients: 0,
    totalRecords: 0,
    errors: []
  };
  
  const startTime = Date.now();
  
  for (let i = 0; i < FILES_TO_IMPORT.length; i++) {
    const filename = FILES_TO_IMPORT[i];
    try {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`[${i + 1}/${FILES_TO_IMPORT.length}]`);
      
      const result = await importFile(filename);
      
      stats.processed++;
      if (result.isNew) {
        stats.newPatients++;
      } else {
        stats.updatedPatients++;
      }
      stats.totalRecords += result.recordsAdded;
      
    } catch (error) {
      console.error(`   ❌ HATA: ${error.message}`);
      stats.errors.push({ filename, error: error.message });
    }
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('\n\n✅ İşlem Tamamlandı!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 ÖZET:');
  console.log(`   • İşlenen dosya: ${stats.processed}/${FILES_TO_IMPORT.length}`);
  console.log(`   • Yeni hasta: ${stats.newPatients}`);
  console.log(`   • Güncellenen hasta: ${stats.updatedPatients}`);
  console.log(`   • Eklenen muayene: ${stats.totalRecords}`);
  console.log(`   • Süre: ${duration} saniye`);
  
  if (stats.errors.length > 0) {
    console.log('\n❌ HATALAR:');
    stats.errors.forEach(({ filename, error }) => {
      console.log(`   • ${filename}: ${error}`);
    });
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(console.error);
