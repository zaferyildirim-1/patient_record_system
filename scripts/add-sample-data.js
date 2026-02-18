const db = require('../src/database');

(async () => {
  await db.init();

  console.log('📝 Test Verileri Ekleniyor...\n');

// TEST DATA - İlk geliştirme oturumaları için dummy veriler
// Gerçek hasta isimleri VS kimlik bilgileri KULLANMAYIN (KVKK uyumu)

// Test 1: Gebelik takibi örneği
const id1 = db.createPatient({
  full_name: 'TEST_HASTA_001',
  age: 28,
  birth_date: '1998-05-12',
  phone_number: '+90 XXX XXX XXXX'  // Maskelenmiş telefon
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

console.log('✅ TEST_HASTA_001 eklendi (2 muayene)');

// Test 2: Hormon tedavisi örneği
const id2 = db.createPatient({
  full_name: 'TEST_HASTA_002',
  age: 35,
  birth_date: '1991-09-20',
  phone_number: '+90 XXX XXX XXXX'  // Maskelenmiş telefon
});

db.createRecord(id2, {
  visit_date: '2026-01-15',
  visit_type: 'Acil Muayene',
  last_menstrual_date: '2026-01-05',
  complaint: 'Adet düzensizliği, karın ağrısı',
  diagnosis: 'Hormon dengesizliği',
  outcome: 'Tedavi başlandı. Diyet ve egzersiz önerildi. 2 ay sonra kontrol'
});

db.createRecord(id2, {
  visit_date: '2026-01-28',
  visit_type: 'Kontrol Muayenesi',
  last_menstrual_date: '2026-01-05',
  complaint: 'İlaç kullanımı sonrası kontrol',
  diagnosis: 'Tedaviye iyi yanıt veriliyor',
  outcome: 'İlaç dozunda değişiklik yok. Diyet devam. 1 ay sonra kontrol'
});

console.log('✅ TEST_HASTA_002 eklendi (2 muayene)');

console.log('\n📊 Özet:');
console.log('   • 2 hasta eklendi');
console.log('   • 4 muayene kaydı oluşturuldu');
console.log('   • Tüm alanlar dolu: Doğum tarihi ✓ Telefon ✓ SAT ✓ Muayene türü ✓');
console.log('\n✨ Veritabanı hazır!');
})();
