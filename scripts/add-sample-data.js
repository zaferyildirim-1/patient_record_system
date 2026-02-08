const db = require('../src/database');

(async () => {
  await db.init();

  console.log('📝 Örnek veriler ekleniyor...\n');

// Örnek 1: Elif Yıldız - Gebelik takibi
const id1 = db.createPatient({
  full_name: 'Elif Yıldız',
  age: 28,
  birth_date: '1998-05-12',
  phone_number: '0532 456 78 90'
});

db.createRecord(id1, {
  visit_date: '2026-01-10',
  visit_type: 'İlk Muayene',
  last_menstrual_date: '2025-12-28',
  complaint: 'Gebelik testi pozitif çıktı, kontrol için geldi',
  diagnosis: 'Gebelik 6. hafta, bebek kalp atışı pozitif',
  outcome: 'Folik asit ve gebelik vitaminleri başlandı. 4 hafta sonra kontrol'
});

db.createRecord(id1, {
  visit_date: '2026-01-28',
  visit_type: 'Kontrol Muayenesi',
  last_menstrual_date: '2025-12-28',
  complaint: 'Kontrol muayenesi, hafif bulantı',
  diagnosis: 'Gebelik 10. hafta, bebek gelişimi normal',
  outcome: 'Bulantı için B6 vitamini önerildi. İlaçlara devam. 4 hafta sonra kontrol'
});

console.log('✅ Elif Yıldız eklendi (2 muayene)');

// Örnek 2: Selin Kara - PKOS tedavisi
const id2 = db.createPatient({
  full_name: 'Selin Kara',
  age: 35,
  birth_date: '1991-09-20',
  phone_number: '+90 545 123 45 67'
});

db.createRecord(id2, {
  visit_date: '2026-01-15',
  visit_type: 'Acil Muayene',
  last_menstrual_date: '2026-01-05',
  complaint: 'Adet düzensizliği, karın ağrısı',
  diagnosis: 'Polikistik over sendromu (PKOS)',
  outcome: 'Metformin 500mg başlandı. Diyet ve egzersiz önerildi. 2 ay sonra kontrol'
});

db.createRecord(id2, {
  visit_date: '2026-01-28',
  visit_type: 'Kontrol Muayenesi',
  last_menstrual_date: '2026-01-05',
  complaint: 'İlaç kullanımı sonrası kontrol',
  diagnosis: 'PKOS tedaviye yanıt veriyor, hormon düzeyleri düzeldi',
  outcome: 'İlaç dozunda değişiklik yok. Kilo kaybı devam etmeli. 1 ay sonra kontrol'
});

console.log('✅ Selin Kara eklendi (2 muayene)');

console.log('\n📊 Özet:');
console.log('   • 2 hasta eklendi');
console.log('   • 4 muayene kaydı oluşturuldu');
console.log('   • Tüm alanlar dolu: Doğum tarihi ✓ Telefon ✓ SAT ✓ Muayene türü ✓');
console.log('\n✨ Veritabanı hazır!');
})();
