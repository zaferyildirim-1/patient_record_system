require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const OpenAI = require('openai');
const database = require('../src/database');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// DOCX IMPORT - Environment değişkenlerini kullan
const DOCX_FOLDER = process.env.DOCX_IMPORT_FOLDER || './imports';

// İmport edilecek dosya listesi - KOMUT SATIRIINDAN AL
// Örnek: node batch-import-gpt4o.js /path/to/file1.docx /path/to/file2.docx
const FILES_TO_IMPORT = process.argv.slice(2).length > 0 
  ? process.argv.slice(2) 
  : [];

// AŞAMA 1: TARİHLERE GÖRE BÖLME PROMPT
const SPLIT_PROMPT = `Sen bir tıbbi metin ayırma uzmanısın. Verilen metni TARİHLERE GÖRE böleceksin.

KURALLAR:
1. Her DD.MM.YYYY veya DD/MM/YYYY tarihi yeni bölüm başlangıcı
2. Tarihten sonraki TÜM bilgiler (bir sonraki tarihe kadar) o bölüme ait
3. Hasta bilgilerini (ad, doğum tarihi, telefon) ayrı tut

ÇIKTI FORMATI (strict JSON):
{
  "patient_info": "ilk paragraftaki hasta bilgileri tam metin",
  "sections": [
    {
      "date": "11.11.2025",
      "content": "Bu tarihten sonraki tüm metin bir sonraki tarihe kadar"
    }
  ]
}

ÖNEMLİ:
- Boşlukları koruma
- Hiçbir bilgiyi atma
- Tarihler arası HER ŞEY o bölüme dahil (ilaçlar, reçeteler, notlar)
- Sadece JSON döndür, açıklama yapma`;

// AŞAMA 2: BÖLÜM PARSE PROMPT
const SECTION_PARSE_PROMPT = `Sen kadın doğum uzmanı bir tıbbi kayıt parse uzmanısın.

Bu bölüm şu tarihe ait: {DATE}

⚠️ KRİTİK KURAL: BAŞLIKLARA TAM UYGUN YERLEŞTIR!

METİN YAPISI (standart):
"Şikâyeti. [metin] SAT: [tarih]
Muayene Bulgusu: [metin]
USG: [metin] veya USG de [metin]
Sonuç: Reçete: [ilaçlar]"

ALAN YERLEŞTİRME KURALLARI:

1. complaint:
   ✅ "Şikâyeti." başlığından sonraki metin (SAT'tan önceki kısım)
   ✅ G#P#Y# ifadesi varsa buraya ekle
   ❌ "Muayene Bulgusu:" veya "USG:" kısmını ASLA buraya koyma

2. last_menstrual_date:
   ✅ "SAT:" kelimesinden hemen sonraki tarih (DD.MM.YYYY)
   ✅ Boş ise → null
   ❌ Başka yerden tarih çekme

3. usg:
   ✅ "USG:" veya "USG de" başlığından sonraki metin
   ✅ Ultrason ölçümleri, FKA, haftalık bilgisi
   ❌ "Muayene Bulgusu:" kısmını buraya koyma
   ❌ "Reçete:" kısmını buraya koyma

4. diagnosis:
   ✅ "Muayene Bulgusu:" başlığından sonraki metin
   ✅ Fizik muayene (vajen, serviks, vulva)
   ❌ USG sonuçlarını buraya koyma
   ❌ Reçeteyi buraya koyma

5. outcome:
   ✅ "Sonuç:" veya "Reçete:" başlığından sonraki metin
   ✅ İlaç listesi, tedavi, öneriler
   ❌ Muayene bulgularını buraya koyma

6. visit_week:
   - "##-#/7 hf" → "##-#/7"
   - "## haftalık" → "##"
   - Yoksa → null

7. visit_type:
   - "İlk Muayene" veya "Kontrol"

8. visit_order:
   - 1 (zorunlu)

ÖRNEK DOĞRU PARSE:
Metin: "Şikâyeti. Karın ağrısı. G2P1Y1. SAT: 15.05.2025
Muayene Bulgusu: vajen normal, serviks temiz.
USG: 15-2/7 haftalık. FKA +.
Reçete: folidoce, imom verildi."

Doğru JSON:
{
  "complaint": "Karın ağrısı. G2P1Y1.",
  "last_menstrual_date": "2025-05-15",
  "usg": "15-2/7 haftalık. FKA +.",
  "diagnosis": "vajen normal, serviks temiz.",
  "outcome": "folidoce, imom verildi.",
  "visit_week": "15-2/7",
  "visit_type": "Kontrol",
  "visit_order": 1
}

⚠️ ASLA YAPMA:
❌ USG'yi complaint'e koyma
❌ Muayene bulgusunu USG'ye koyma
❌ Reçeteyi diagnosis'e koyma
❌ Başlıkları karıştırma

Sadece JSON döndür.

KRİTİK KURALLAR:
1. Bu bölümdeki TÜM bilgiler bu tarihe ait
2. "Reçete:" başlığından sonraki ilaçlar outcome'a
3. Paragraf sonundaki ilaçlar bu tarihe ait (sonraki tarihe DEĞİL!)
4. "verildi", "başlandı" kelimeleri genelde ilaç sonudur
5. Boş alan = null (yoktur anlamında)
6. G#P#Y# genelde complaint'e ama bağlamına göre diagnosis'e de gidebilir
7. ASLA BİR ŞEY KAYBETME - hepsini bir yere yaz

TIP KISALTMALAR:
• G3P2Y2 = Gravida 3, Parite 2, Yaşayan 2
• 32-2/7 hf = 32 hafta 2 gün gebelik
• FKA = Fetal Kalp Atımı
• SAT = Son Adet Tarihi
• MR = Menstrual Regülasyon
• Rv. = Randevu
• Cin-erk/kız = Cinsiyet

ÇIKTI (strict JSON):
{
  "complaint": "...",
  "last_menstrual_date": "YYYY-MM-DD" veya null,
  "menstrual_day": 5 veya null,
  "usg": "...",
  "diagnosis": "...",
  "outcome": "...",
  "visit_week": "32-2/7" veya null,
  "visit_type": "İlk Muayene" veya "Kontrol",
  "visit_order": 1
}

Sadece JSON döndür, açıklama yapma.`;

// HASTA BİLGİSİ PARSE PROMPT
const PATIENT_PARSE_PROMPT = `Bu hastanın temel bilgilerini çıkar:

ÖRN: "Hastanın Adı Soyadı: Merve Yılmaz D.T:05.04.1999 Tarih: 11.11.2025 Telefon numarası: 541 403 09 23"

ÇIKTI (strict JSON):
{
  "full_name": "Ad Soyad",
  "birth_date": "YYYY-MM-DD" veya null,
  "phone_number": "telefon" veya null,
  "age": 30 veya null
}

KURALLAR:
- D.T: = Doğum Tarihi
- "Tarih:" = Muayene tarihi (kullanma)
- Telefon herhangi formatta olabilir
- Yaş birth_date'den hesaplanabilir veya metinde olabilir
- Sadece JSON döndür`;

async function extractTextFromDocx(filePath) {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function splitTextBySections(text) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SPLIT_PROMPT },
      { role: 'user', content: text }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
}

async function parsePatientInfo(patientInfoText) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: PATIENT_PARSE_PROMPT },
      { role: 'user', content: patientInfoText }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
}

async function parseSection(sectionContent, sectionDate) {
  const prompt = SECTION_PARSE_PROMPT.replace('{DATE}', sectionDate);
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: sectionContent }
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
}

function parseDateTurkish(dateStr) {
  if (!dateStr) return null;
  
  const match = dateStr.match(/(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{4})/);
  if (!match) return null;
  
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function calculateAge(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

async function processFile(filename) {
  const filePath = path.join(DOCX_FOLDER, filename);
  
  // 1. DOCX'ten metin çıkar
  const text = await extractTextFromDocx(filePath);
  console.log(`   📏 Metin uzunluğu: ${text.length} karakter`);
  
  // 2. AŞAMA 1: Metni tarihlere göre böl
  console.log(`   🔪 Tarihlere göre bölümlere ayrılıyor...`);
  const split = await splitTextBySections(text);
  console.log(`   ✂️  ${split.sections.length} bölüm bulundu`);
  
  // 3. Hasta bilgilerini parse et
  console.log(`   👤 Hasta bilgileri parse ediliyor...`);
  const patientData = await parsePatientInfo(split.patient_info);
  
  // Yaş hesaplama
  if (!patientData.age && patientData.birth_date) {
    patientData.age = calculateAge(patientData.birth_date);
  }
  
  if (!patientData.full_name || !patientData.age) {
    throw new Error('Hasta bilgileri eksik (ad veya yaş yok)');
  }
  
  // 4. Hasta var mı kontrol et
  const existingPatients = database.listPatients({ full_name: patientData.full_name });
  let patientId;
  let isNew = false;
  
  if (existingPatients.length > 0) {
    patientId = existingPatients[0].id;
    const patient = database.getPatient(patientId);
    console.log(`   ⚠️  Hasta mevcut: ${patientData.full_name} (${patient.patient_code})`);
  } else {
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
  
  // 5. AŞAMA 2: Her bölümü parse et ve kaydet
  let addedRecords = 0;
  
  for (let i = 0; i < split.sections.length; i++) {
    const section = split.sections[i];
    console.log(`   📋 [${i+1}/${split.sections.length}] ${section.date} parse ediliyor...`);
    
    const record = await parseSection(section.content, section.date);
    
    const visitDate = parseDateTurkish(section.date);
    if (!visitDate) {
      console.log(`   ⚠️  Tarih parse edilemedi: ${section.date}`);
      continue;
    }
    
    database.createMedicalRecord({
      patient_id: patientId,
      visit_date: visitDate,
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
  
  return { isNew, addedRecords };
}

async function main() {
  await database.init();
  
  console.log('🏥 GPT-4o İki Aşamalı İçe Aktarma Başladı');
  console.log(`📁 Klasör: ${DOCX_FOLDER}`);
  console.log(`📋 Dosya sayısı: ${FILES_TO_IMPORT.length}\n`);
  
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
    
    console.log('\n' + '━'.repeat(80));
    console.log(`[${i+1}/${FILES_TO_IMPORT.length}]\n`);
    console.log(`📄 [${filename}] İşleniyor...`);
    
    try {
      const result = await processFile(filename);
      
      if (result.isNew) {
        stats.newPatients++;
      } else {
        stats.updatedPatients++;
      }
      
      stats.totalRecords += result.addedRecords;
      stats.processed++;
      
    } catch (err) {
      console.log(`   ❌ HATA: ${err.message}`);
      stats.errors.push({ file: filename, error: err.message });
    }
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  console.log('\n\n✅ İşlem Tamamlandı!');
  console.log('━'.repeat(80));
  console.log('📊 ÖZET:');
  console.log(`   • İşlenen dosya: ${stats.processed}/${FILES_TO_IMPORT.length}`);
  console.log(`   • Yeni hasta: ${stats.newPatients}`);
  console.log(`   • Güncellenen hasta: ${stats.updatedPatients}`);
  console.log(`   • Eklenen muayene: ${stats.totalRecords}`);
  console.log(`   • Süre: ${duration} saniye`);
  
  if (stats.errors.length > 0) {
    console.log(`\n❌ HATALAR:`);
    stats.errors.forEach(e => console.log(`   • ${e.file}: ${e.error}`));
  }
  
  console.log('━'.repeat(80));
}

main().catch(console.error);
