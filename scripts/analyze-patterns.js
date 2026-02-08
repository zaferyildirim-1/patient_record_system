require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

const FILES = [
  'Elif Yıldız .docx',
  'Fadime Başaran .docx',
  'Selvi Arıcan .docx',
  'Figen Samur .docx',
  'Ayşegül Topay .docx',
  'Huriye Toprak .docx',
  'Gülsüm Kübra Kara .docx',
  'Havva Yavuz .docx',
  'Gülsüm Canpulat .docx',
  'Serpil Şahin .docx',
  'Saliha Bayram .docx',
  'Fatmanur Bütüner .docx',
  'Sibe El Ziyeb .docx',
  'Şerife Ünay .docx',
  'Gülistan Tokacı .docx',
  'Sebahat Pala .docx',
  'Sedanur Kaçar .docx',
  'Aysel Zeren .docx',
  'Şerife Akpınar .docx',
  'Havva Pekşen .docx',
  'Betül Akyüz .docx',
  'Emel Kutlu .docx',
  'Hilal İnce .docx',
  'Hatice Tekeli .docx',
  'Rukiye Topbaş .docx'
];

const DOCX_FOLDER = '/Users/zaferyildirim/Desktop/Hasta Muayene dosyaları';

async function extractTextFromDocx(filePath) {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

async function analyzePatterns() {
  console.log('🔍 25 DOCX Dosyası Pattern Analizi\n');
  console.log('='.repeat(80));
  
  const patterns = {
    dateFormats: new Set(),
    satVariations: new Set(),
    medicationIndicators: new Set(),
    sectionSeparators: new Set(),
    diagnoseKeywords: new Set(),
    complaintKeywords: new Set(),
    multipleVisits: 0,
    singleVisit: 0,
    totalFiles: 0
  };
  
  for (const filename of FILES) {
    const filePath = path.join(DOCX_FOLDER, filename);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  [${filename}] - Dosya bulunamadı`);
      continue;
    }
    
    try {
      const text = await extractTextFromDocx(filePath);
      patterns.totalFiles++;
      
      console.log(`\n📄 ${filename}`);
      console.log('-'.repeat(80));
      console.log(text);
      console.log('-'.repeat(80));
      
      // Tarih pattern'leri (DD.MM.YYYY veya DD/MM/YYYY)
      const dateMatches = text.match(/\d{1,2}[\.\/]\d{1,2}[\.\/]\d{4}/g);
      if (dateMatches) {
        dateMatches.forEach(d => patterns.dateFormats.add(d));
        if (dateMatches.length > 1) {
          patterns.multipleVisits++;
          console.log(`  ✓ Çoklu ziyaret: ${dateMatches.length} tarih bulundu`);
        } else {
          patterns.singleVisit++;
        }
      }
      
      // SAT varyasyonları
      const satMatch = text.match(/(SAT[:\s]*[^\n]{0,30})/gi);
      if (satMatch) {
        satMatch.forEach(s => patterns.satVariations.add(s.trim()));
      }
      
      // İlaç göstergeleri
      const medMatches = text.match(/(reçete|ilaç|tedavi|verildi|başlandı)[:\s]?[^\n]{0,50}/gi);
      if (medMatches) {
        medMatches.slice(0, 3).forEach(m => patterns.medicationIndicators.add(m.trim()));
      }
      
      // Şikayet anahtar kelimeleri
      const complaintMatch = text.match(/(şikâyet|şikayet|complaint)[:\s]?[^\n]{0,40}/gi);
      if (complaintMatch) {
        complaintMatch.slice(0, 2).forEach(c => patterns.complaintKeywords.add(c.trim()));
      }
      
      // Teşhis/sonuç anahtar kelimeleri
      const diagnosisMatch = text.match(/(teşhis|tanı|bulgu|sonuç|diagnosis)[:\s]?[^\n]{0,40}/gi);
      if (diagnosisMatch) {
        diagnosisMatch.slice(0, 2).forEach(d => patterns.diagnoseKeywords.add(d.trim()));
      }
      
    } catch (err) {
      console.log(`  ❌ HATA: ${err.message}`);
    }
  }
  
  console.log('\n\n');
  console.log('='.repeat(80));
  console.log('📊 PATTERN ANALİZ SONUÇLARI');
  console.log('='.repeat(80));
  
  console.log(`\n1️⃣  GENEL İSTATİSTİKLER:`);
  console.log(`   • Toplam dosya: ${patterns.totalFiles}`);
  console.log(`   • Çoklu ziyaret: ${patterns.multipleVisits} (${(patterns.multipleVisits/patterns.totalFiles*100).toFixed(1)}%)`);
  console.log(`   • Tek ziyaret: ${patterns.singleVisit} (${(patterns.singleVisit/patterns.totalFiles*100).toFixed(1)}%)`);
  
  console.log(`\n2️⃣  TARİH FORMATLARI (ilk 20 örnek):`);
  Array.from(patterns.dateFormats).slice(0, 20).forEach(d => console.log(`   • ${d}`));
  
  console.log(`\n3️⃣  SAT VARYASYONLARI (${patterns.satVariations.size} farklı):`);
  Array.from(patterns.satVariations).slice(0, 15).forEach(s => console.log(`   • ${s}`));
  
  console.log(`\n4️⃣  İLAÇ/TEDAVİ GÖSTERGELERİ (ilk 15):`);
  Array.from(patterns.medicationIndicators).slice(0, 15).forEach(m => console.log(`   • ${m}`));
  
  console.log(`\n5️⃣  ŞİKAYET ANAHTAR KELİMELERİ:`);
  Array.from(patterns.complaintKeywords).slice(0, 10).forEach(c => console.log(`   • ${c}`));
  
  console.log(`\n6️⃣  TEŞHİS/SONUÇ ANAHTAR KELİMELERİ:`);
  Array.from(patterns.diagnoseKeywords).slice(0, 10).forEach(d => console.log(`   • ${d}`));
  
  console.log('\n' + '='.repeat(80));
}

analyzePatterns().catch(console.error);
