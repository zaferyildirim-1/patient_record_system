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

const PROMPT = `Bu kadın doğum hastası dosyasından bilgileri JSON formatında çıkar.

Kurallar:
1. Ad Soyad, D.T (doğum tarihi), Telefon numarasını bul
2. Yaşı doğum tarihinden hesapla (bugün: 2 Şubat 2026)
3. Tarihleri YYYY-MM-DD formatına çevir
4. Her tarih (örn: 07.08.2025) bir muayene kaydıdır
5. SAT (Son Adet Tarihi) varsa al
6. "Adetin X. Günü" ifadesinden sayıyı al
7. USG, Şikayet, Teşhis, Reçete/Tedavi bilgilerini ayır

JSON formatı:
{
  "patient": {
    "full_name": "...",
    "birth_date": "YYYY-MM-DD",
    "age": sayı,
    "phone_number": "..."
  },
  "visits": [
    {
      "visit_date": "YYYY-MM-DD",
      "last_menstrual_date": "YYYY-MM-DD veya null",
      "menstrual_day": sayı veya null,
      "complaint": "...",
      "usg": "...",
      "diagnosis": "...",
      "outcome": "..."
    }
  ]
}

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

  const parsed = JSON.parse(completion.choices[0].message.content);
  console.log(`  ✅ ${parsed.visits?.length || 0} muayene kaydı bulundu`);
  return parsed;
}

async function saveToDatabase(data) {
  const patientId = db.createPatient({
    full_name: data.patient.full_name,
    age: data.patient.age,
    birth_date: data.patient.birth_date,
    phone_number: data.patient.phone_number
  });

  console.log(`  💾 Hasta kaydedildi: ${data.patient.full_name}`);

  let count = 0;
  for (const visit of data.visits || []) {
    const visitDate = new Date(visit.visit_date);
    const year = visitDate.getFullYear();
    const weekNumber = getWeekNumber(visitDate);
    
    db.createMedicalRecord({
      patient_id: patientId,
      visit_date: visit.visit_date,
      visit_order: count + 1,
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
    const count = await saveToDatabase(parsed);

    return { success: true, fileName, patient: parsed.patient.full_name, count };
  } catch (error) {
    console.error(`  ❌ Hata: ${error.message}\n`);
    return { success: false, fileName, error: error.message };
  }
}

async function main() {
  console.log('🏥 DOCX Import Aracı (Test)\n');
  console.log('='.repeat(50));

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'buraya-api-keyini-yaz') {
    console.error('\n❌ .env dosyasına OpenAI API key\'ini ekle!\n');
    process.exit(1);
  }

  await db.init();
  console.log('✅ Veritabanı hazır\n');

  const docxFolder = '/Users/zaferyildirim/Desktop/hasta_docx';
  const files = fs.readdirSync(docxFolder)
    .filter(f => f.endsWith('.docx'))
    .slice(0, 2)
    .map(f => path.join(docxFolder, f));

  console.log(`🧪 ${files.length} dosya test edilecek:`);
  files.forEach((f, i) => console.log(`   ${i + 1}. ${path.basename(f)}`));
  console.log('='.repeat(50));

  const results = [];
  for (const file of files) {
    const result = await processDocx(file);
    results.push(result);
  }

  console.log('='.repeat(50));
  console.log('📊 ÖZET\n');
  const success = results.filter(r => r.success);
  console.log(`✅ Başarılı: ${success.length}/${results.length}`);
  if (success.length > 0) {
    success.forEach(r => console.log(`  • ${r.patient} - ${r.count} kayıt`));
  }
  console.log('='.repeat(50));
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
