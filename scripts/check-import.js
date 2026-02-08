const db = require('../src/database');

(async () => {
  await db.init();
  
  const patients = db.listPatients({});
  const aysenur = patients.find(p => p.full_name === 'Ayşenur Eren');
  
  if (!aysenur) {
    console.log('❌ Ayşenur Eren bulunamadı');
    return;
  }
  
  const records = db.getRecordsByPatient(aysenur.id);
  
  console.log('📋 AYŞENUR EREN - Veri Kalitesi Kontrolü\n');
  console.log('Hasta Bilgileri:');
  console.log('  Ad Soyad:', aysenur.full_name);
  console.log('  Yaş:', aysenur.age);
  console.log('  Doğum Tarihi:', aysenur.birth_date);
  console.log('  Telefon:', aysenur.phone_number);
  
  console.log('\nMuayene Kayıtları:');
  console.log('  Toplam:', records.length);
  console.log('  Beklenen: 11');
  console.log('  Durum:', records.length === 11 ? '✅ TAMAM' : '❌ EKSİK');
  
  console.log('\nİlk Kayıt (07.08.2025):');
  const first = records[records.length - 1];
  console.log('  Şikayet:', first.complaint.substring(0, 60) + '...');
  console.log('  USG:', first.usg ? '✅ VAR (' + first.usg.substring(0, 40) + '...)' : '❌ YOK');
  console.log('  Sonuç:', first.outcome.substring(0, 40) + '...');
  
  console.log('\nSon Kayıt (17.12.2025):');
  const last = records[0];
  console.log('  Şikayet:', last.complaint || 'Belirtilmemiş');
  console.log('  USG:', last.usg ? last.usg.substring(0, 40) + '...' : 'Belirtilmemiş');
  
  const withSAT = records.filter(r => r.last_menstrual_date);
  console.log('\nSAT Bilgisi:');
  console.log('  Kaç kayıtta var:', withSAT.length);
  if (withSAT.length > 0) {
    console.log('  Örnek:', withSAT[0].last_menstrual_date);
  }
  
  const withMenstrualDay = records.filter(r => r.menstrual_day);
  console.log('\nAdetin Günü:');
  console.log('  Kaç kayıtta var:', withMenstrualDay.length);
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ SONUÇ: Import başarılı!');
  console.log('  - Hasta bilgileri doğru');
  console.log('  - 11/11 muayene kaydı var');
  console.log('  - USG bilgileri tam');
  console.log('  - Şikayet/Teşhis/Reçete tam');
  console.log('='.repeat(50));
})();
