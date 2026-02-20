const mammoth = require('mammoth');
const OpenAI = require('openai');
require('dotenv').config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function importOne() {
  const db = require('./src/database.js');
  await db.initializeDatabase();
  const docPath = '/Users/zaferyildirim/Desktop/Hasta Muayene dosyaları/Melek Abdullah .docx';
  
  try {
    console.log('📄 Melek Abdullah import ediliyor...');
    const result = await mammoth.extractRawText({ path: docPath });
    const text = result.value;
    
    const prompt = `Sen deneyimli bir Kadın Hastalıkları ve Doğum uzmanı ve tıbbi dokümantasyon uzmanısın.
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
- birth_date: “D.T” veya “Doğum Tarihi” varsa YYYY-MM-DD’ye çevir (örn 01.01.1994 → 1994-01-01). Yoksa null.
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
${text}
>>>
`;

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Sadece geçerli JSON döndür. Açıklama veya markdown yazma.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0,
      max_tokens: 5000,
      response_format: { type: 'json_object' }
    });

    const jsonText = response.choices[0].message.content;
    console.log('📤 GPT Response:', jsonText.substring(0, 200));
    const data = JSON.parse(jsonText);
    
    // Insert patient
    const patientResult = db.createPatient({
      full_name: data.patient.full_name,
      birth_date: data.patient.birth_date,
      age: data.patient.age,
      phone_number: data.patient.phone_number,
      chronic_conditions: data.patient.chronic_conditions || [],
      medications: data.patient.medications || [],
      allergies: data.patient.allergies || [],
      past_surgeries: data.patient.past_surgeries || []
    });
    
    const patientId = patientResult.id;
    console.log('✅ Hastası oluşturuldu - ID:', patientId);
    console.log('   ', patientResult.full_name);
    
    // Insert visits
    let recordCount = 0;
    console.log('\n📝 Visits processing:', data.visits?.length || 0);
    
    if (!data.visits || !Array.isArray(data.visits)) {
      console.log('❌ Visits array missing or invalid!');
      console.log('Data keys:', Object.keys(data));
      process.exit(1);
    }
    
    data.visits.forEach((v, idx) => {
      try {
        console.log(`✓ Visit ${idx+1}:`, v.visit_date, '-', v.complaint?.substring(0, 30));
        const recordResult = db.createMedicalRecord({
          patient_id: patientId,
          visit_date: v.visit_date,
          visit_type: v.visit_type,
          visit_week: null,
          menstrual_day: v.menstrual_day,
          complaint: v.complaint,
          diagnosis: v.diagnosis,
          usg: v.usg,
          outcome: v.outcome
        });
        console.log('  ✅ Record ID:', recordResult?.id);
        recordCount++;
      } catch (err) {
        console.error(`  ❌ Record error:`, err);
      }
    });
    
    console.log('✅ Record oluşturuldu:', recordCount);
    console.log('\n📊 SİSTEMDE GÖRÜNEN VERİLER:');
    console.log('═'.repeat(60));
    console.log('Hasta Adı:', data.patient.full_name);
    console.log('Doğum Tarihi:', data.patient.birth_date);
    console.log('Yaş:', data.patient.age);
    console.log('Telefon:', data.patient.phone_number);
    console.log('Toplam Ziyaret:', data.visits.length);
    
    console.log('\n📅 HER ZİYARETİN DETAYLı VERİSİ:');
    console.log('═'.repeat(60));
    data.visits.forEach((v, i) => {
      console.log(`\n✓ ZİYARET ${i+1} (${v.visit_date})`);
      console.log('  Şikâyet:', v.complaint || '(boş)');
      console.log('  Muayene Bulgusu:', v.diagnosis || '❌ BOŞ!');
      console.log('  USG:', v.usg || '(boş)');
      console.log('  Reçete/Sonuç:', v.outcome || '(boş)');
    });
    
    console.log('\n✅ İMPORT BAŞARILI - Database hazır');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

importOne();
