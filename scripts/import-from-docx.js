#!/usr/bin/env node

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const OpenAI = require('openai');
const db = require('../src/database');

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRetryableOpenAIError(err) {
  if (!err) return false;
  if (err.name === 'AbortError') return true;

  const retryableStatuses = new Set([429, 500, 502, 503, 504]);
  if (retryableStatuses.has(err.status)) return true;

  const retryableCodes = new Set([
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'EAI_AGAIN',
    'ENOTFOUND'
  ]);
  if (retryableCodes.has(err.code)) return true;

  return false;
}

function computeBackoffMs(attempt) {
  const base = 1000;
  const max = 60000;
  const expo = Math.min(max, base * (2 ** (attempt - 1)));
  const jitter = Math.floor(Math.random() * 250);
  return Math.min(max, expo + jitter);
}

const PROMPT = `Sen deneyimli bir Kadın Hastalıkları ve Doğum uzmanı ve tıbbi dokümantasyon uzmanısın.
Görevin: Verilen Türkçe hasta muayene metnini yapısal JSON verisine dönüştürmek.

SADECE geçerli JSON döndür. Markdown/açıklama/yazı döndürme.
Klinik veri kaybı YASAK: Metindeki her tıbbi bilgi mutlaka bir alana yerleşsin.

DÖNDÜRECEĞİN JSON ŞEMASI (anahtarları birebir koru):
{
  "patient": {
    "full_name": "",
    "birth_date": null,
    "age": null,
    "phone_number": null,
    "chronic_conditions": [],
    "medications": [],
    "allergies": [],
    "past_surgeries": []
  },
  "visits": [
    {
      "visit_date": "",
      "visit_type": "Kontrol",
      "last_menstrual_date": null,
      "menstrual_day": null,
      "complaint": "",
      "diagnosis": "",
      "usg": "",
      "outcome": ""
    }
  ]
}

BELGE YAPISI (genel):
- En üstte hasta bilgileri olabilir: “Hastanın Adı Soyadı”, “D.T”, “Telefon numarası” vb.
- Muayeneler genellikle bir TARİH ile başlar (örn: 11.07.2025). O tarihten bir sonraki tarihe kadar olan metin o ziyarete aittir.
- Ziyaret içinde “Şikâyeti / Muayene Bulgusu / USG / Reçete / Sonuç / Öneri” başlıkları olabilir veya olmayabilir.

ALAN KURALLARI:
1) patient:
- full_name: “Hastanın Adı Soyadı”
- birth_date: “D.T” veya “Doğum Tarihi” varsa YYYY-MM-DD’ye çevir (örn 16.09.1997 → 1997-09-16). Yoksa null.
- age: birth_date varsa hesapla; yoksa null.
- phone_number: telefon varsa +90 ile normalize et; yoksa null.
- chronic_conditions / medications / allergies / past_surgeries: yalnızca hastanın genel bilgisi/öyküsünden (ziyaret reçetelerinden ilaç yazma).

2) visits:
- Her ziyarette tüm alanlar olmalı (boşsa "" veya null).
- visit_date: mutlaka YYYY-MM-DD.

3) ORPHAN (etiketsiz) METİN KURALI (kritik):
- Ziyaret bölümünde “Şikâyeti:” etiketi olmasa bile, TARİH ile Muayene/USG/Reçete/Sonuç/Öneri arasında kalan açıklayıcı cümleler kaybolmayacak.
- Bu tür etiketsiz metinleri öncelikle complaint alanına ekle.
- Şikâyeti etiketi varsa complaint’e onu yaz; ayrıca tarih bloğunda kalan etiketsiz klinik/öykü metni de complaint’e ekle (veri kaybı olmasın).
- Örnek tipik orphan metinler: “Eşinin sperm tahlili…”, “Adet görmüş.”, “Adetinin 9. Günü.”, “Adet rötarı.” gibi.
 - Not: Etiketsiz metin bir LAB/TEST sonucu olsa bile (TİT, kültür, spermiyogram vb.) complaint alanına da mutlaka ekle. (İstersen diagnosis’e de ekleyebilirsin.)
 - USG ölçümleri/bulguları (USG:, FKA, CRL, endometrium, folikül ölçüleri vb.) complaint’e yazma; usg alanına yaz.

3b) MENSTRÜEL GÜN KURALI (kritik):
- “Adetinin X. Günü”, “X. Günü”, “1. Günü”, “13. Günü” gibi ifadeler USG DEĞİLDİR.
- Bu ifadelerden X sayısını menstrual_day alanına yaz.
- complaint boş kalacaksa complaint içine en azından bu ifadeyi ekle (örn: “Adetinin 9. Günü.”).
- Bu ifade “USG:” ile aynı satırda geçse bile complaint/menstrual_day’e taşınmalı.

4) USG / diagnosis / outcome ayrımı:
- usg: sadece ultrason ölçüm ve bulguları (FKA/CRL/hafta/endometrium/folikül ölçüleri/plasenta/amniyon vb.).
- diagnosis: muayene bulguları + klinik değerlendirme + lab sonuçları (TİT/bakteri/kültür/spermiyogram vb.). USG ölçümlerini diagnosis’e yazma.
- outcome: reçete/tedavi/plan/öneri/sonuç.
 - Karışık başlık kuralı: “Muayene Bulgusu” içinde açıkça “USG” ile başlayan veya belirgin USG terimleri (uterus/over/endometrium/folikül/FKA/CRL/GS vb.) içeren cümleler varsa bunları usg alanına taşı; diagnosis alanında tekrar etme.

5) Ziyaret sırası: kronolojik (en eski → en yeni).

FORMAT ZORUNLULUĞU:
- patient.birth_date ve visits[].visit_date mutlaka YYYY-MM-DD formatında olmalı. (örn 11.07.2025 → 2025-07-11)
- patient.phone_number mümkünse "+90" ile başlamalı (örn: 533 022 00 68 → +90 533 022 00 68). Yapamazsan null.

DOSYA METNİ:
<<<
`;

async function parseWithAI(text, fileName) {
  console.log(`  🤖 AI ile parse ediliyor...`);
  console.log(`  🔑 API Key: ${process.env.OPENAI_API_KEY ? '✅ Var' : '❌ YOK'}`);

  const maxAttempts = Number.isFinite(Number(process.env.OPENAI_MAX_ATTEMPTS))
    ? Number(process.env.OPENAI_MAX_ATTEMPTS)
    : 6;
  const model = process.env.OPENAI_MODEL || 'gpt-4o';

  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: 'Sadece geçerli JSON döndür. Açıklama veya markdown yazma.' },
          { role: 'user', content: PROMPT + text + '\n>>>\n' }
        ],
        temperature: 0,
        response_format: { type: 'json_object' },
        signal: controller.signal
      });

      const content = completion.choices[0].message.content;
      console.log(`  📝 AI output (ilk 200 char): ${content.substring(0, 200)}...`);

      try {
        const parsed = JSON.parse(content);
        console.log(`  ✅ ${parsed.visits?.length || 0} muayene kaydı bulundu`);
        return parsed;
      } catch (parseErr) {
        console.error(`  ❌ JSON parse hatası: ${parseErr.message}`);
        lastErr = parseErr;
        if (attempt < maxAttempts) {
          const waitMs = computeBackoffMs(attempt);
          console.warn(`  ⏳ Tekrar denenecek (parse). Deneme ${attempt}/${maxAttempts} → ${waitMs}ms bekleniyor`);
          // eslint-disable-next-line no-await-in-loop
          await sleep(waitMs);
          continue;
        }
        throw parseErr;
      }
    } catch (apiErr) {
      lastErr = apiErr;

      const status = apiErr?.status;
      const code = apiErr?.code;
      console.error(`  ❌ OpenAI API Hatası: ${apiErr.message}`);
      if (status) console.error(`     Status: ${status}`);
      if (code) console.error(`     Code: ${code}`);
      console.error(`     Type: ${apiErr.constructor?.name || typeof apiErr}`);
      if (status === 401) console.error(`     → API Key geçersiz veya süresi dolmuş`);
      if (status === 429) console.error(`     → Rate limit aşıldı, bekleyip tekrar denenecek`);
      if (status === 500) console.error(`     → OpenAI API server hatası`);
      if (code === 'ECONNREFUSED') console.error(`     → Ağa bağlanılamıyor`);

      if (attempt < maxAttempts && isRetryableOpenAIError(apiErr)) {
        const waitMs = computeBackoffMs(attempt);
        console.warn(`  ⏳ Tekrar denenecek. Deneme ${attempt}/${maxAttempts} → ${waitMs}ms bekleniyor`);
        // eslint-disable-next-line no-await-in-loop
        await sleep(waitMs);
        continue;
      }

      throw apiErr;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastErr;
}

async function saveToDatabase(data, fileName) {
  try {
    if (!data.patient) {
      throw new Error('Patient data missing from parsed data');
    }

    // Log AI output to file for verification (per-file)
    const outputsDir = path.join(__dirname, '../import-outputs');
    ensureDirSync(outputsDir);
    const safeBase = (fileName || 'import').replace(/[^a-zA-Z0-9._-]/g, '_');
    const outPath = path.join(outputsDir, `${safeBase}.json`);
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
    console.log(`  💾 AI çıktısı import-outputs/${path.basename(outPath)} dosyasına kaydedildi`);

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

  let extractedText = '';
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    extractedText = result.value;
    console.log(`  📖 ${extractedText.length} karakter okundu`);

    const parsed = await parseWithAI(extractedText, fileName);
    
    // AI output'unu yazdır (debug)
    console.log(`  📋 Parsed data:`, JSON.stringify(parsed, null, 2).substring(0, 300) + '...');
    
    const count = await saveToDatabase(parsed, fileName);

    return { success: true, fileName, patient: parsed.patient.full_name, count };
  } catch (error) {
    console.error(`  ❌ Hata: ${error.message}`);
    console.error(`  Stack: ${error.stack}`);

    try {
      if (extractedText && extractedText.trim()) {
        const errorsDir = path.join(__dirname, '../import-errors');
        ensureDirSync(errorsDir);
        const safeBase = (fileName || 'import').replace(/[^a-zA-Z0-9._-]/g, '_');
        const errPath = path.join(errorsDir, `${safeBase}.txt`);
        const payload = [
          `FILE: ${fileName}`,
          `ERROR: ${error.message}`,
          `STACK: ${error.stack || ''}`,
          '',
          '--- EXTRACTED TEXT ---',
          extractedText
        ].join('\n');
        fs.writeFileSync(errPath, payload);
        console.error(`  🧾 Ham metin import-errors/${path.basename(errPath)} dosyasına kaydedildi`);
      }
    } catch (writeErr) {
      console.error(`  ⚠️ Hata raporu yazılamadı: ${writeErr.message}`);
    }

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

  const argv = process.argv.slice(2);
  const paths = [];
  let limit = null;
  let skip = 0;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--limit' && argv[i + 1]) {
      limit = Number(argv[i + 1]);
      i++;
      continue;
    }
    if (arg === '--skip' && argv[i + 1]) {
      skip = Number(argv[i + 1]);
      i++;
      continue;
    }
    paths.push(arg);
  }

  if (paths.length === 0) {
    console.log('Kullanım:');
    console.log('  node scripts/import-from-docx.js "/path/to/file1.docx" "/path/to/file2.docx"');
    console.log('  node scripts/import-from-docx.js "/path/to/folder-with-docx"');
    console.log('  node scripts/import-from-docx.js "/path/to/folder-with-docx" --limit 10');
    console.log('  node scripts/import-from-docx.js "/path/to/folder-with-docx" --skip 10 --limit 10');
    console.log('\nNot: Klasör verirseniz o klasördeki tüm .docx dosyaları içe aktarılır.');
    process.exit(1);
  }

  const expandToDocxFiles = (inputPath) => {
    const stat = fs.statSync(inputPath);
    if (stat.isDirectory()) {
      const collator = new Intl.Collator('tr', { numeric: true, sensitivity: 'base' });
      return fs
        .readdirSync(inputPath)
        .filter(name => name.toLowerCase().endsWith('.docx'))
        .sort((a, b) => collator.compare(a, b))
        .map(name => path.join(inputPath, name));
    }
    return [inputPath];
  };

  let docxFiles = paths.flatMap(p => {
    try {
      return expandToDocxFiles(p);
    } catch {
      return [p];
    }
  });

  docxFiles = docxFiles.filter(Boolean);
  if (Number.isFinite(skip) && skip > 0) {
    docxFiles = docxFiles.slice(skip);
  }
  if (Number.isFinite(limit) && limit > 0) {
    docxFiles = docxFiles.slice(0, limit);
  }

  const results = [];
  for (const filePath of docxFiles) {
    if (!fs.existsSync(filePath)) {
      console.error(`\n❌ Dosya bulunamadı: ${filePath}`);
      results.push({ success: false, fileName: path.basename(filePath), error: 'File not found' });
      continue;
    }

    console.log(`\n🧪 Import dosyası: ${path.basename(filePath)}`);
    console.log('='.repeat(50));
    // eslint-disable-next-line no-await-in-loop
    const result = await processDocx(filePath);
    results.push(result);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 TOPLAM SONUÇ\n');
  for (const r of results) {
    if (r.success) {
      console.log(`✅ ${r.fileName} → Hasta: ${r.patient} | Kayıt: ${r.count}`);
    } else {
      console.log(`❌ ${r.fileName} → Hata: ${r.error}`);
    }
  }
  console.log('='.repeat(50));
}

main().catch(err => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
