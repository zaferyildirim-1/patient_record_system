require('dotenv').config();
const path = require('path');

// Initialize database
const db = require(path.join(__dirname, '../src/database'));

async function addTestPatients() {
  try {
    await db.initializeDatabase();
    console.log('✅ Database initialized\n');

    // Test patients data
    const testPatients = [
      {
        full_name: 'Ayşe Yılmaz',
        age: 34,
        birth_date: '1991-07-15',
        phone_number: '+90 532 456 7890',
        email: 'ayse.yilmaz@email.com',
        address: 'Ankara, Çankaya Mahallesi, 123 Sokak',
        blood_type: 'O',
        marital_status: 'Evli',
        occupation: 'Öğretmen',
        emergency_contact_name: 'Mehmet Yılmaz',
        emergency_contact_phone: '+90 532 456 7891',
        chronic_conditions: ['Hipertansiyon', 'Tip 2 Diyabet'],
        medications: ['Metformin 500mg', 'Lisinopril 10mg'],
        allergies: ['Penisilin'],
        past_surgeries: ['Apendektomi (2010)', 'Sezaryen (2018)']
      },
      {
        full_name: 'Fatma Kaya',
        age: 28,
        birth_date: '1997-03-22',
        phone_number: '+90 533 789 4560',
        email: 'fatma.kaya@email.com',
        address: 'İstanbul, Beşiktaş, Ortabayır Caddesi',
        blood_type: 'A',
        marital_status: 'Bekar',
        occupation: 'Hemşire',
        emergency_contact_name: 'Zeynep Kaya',
        emergency_contact_phone: '+90 533 789 4561',
        chronic_conditions: [],
        medications: [],
        allergies: ['Sulfonamidler'],
        past_surgeries: []
      },
      {
        full_name: 'Selin Demir',
        age: 42,
        birth_date: '1983-11-08',
        phone_number: '+90 534 123 4560',
        email: 'selin.demir@email.com',
        address: 'İzmir, Alsancak, Kıbrıs Şehitleri Caddesi',
        blood_type: 'B',
        marital_status: 'Boşanmış',
        occupation: 'Muhasebeci',
        emergency_contact_name: 'Elif Demir',
        emergency_contact_phone: '+90 534 123 4561',
        chronic_conditions: ['Tiroid hastalığı', 'GORD'],
        medications: ['Levotiroxine 75mcg', 'Omeprazole 20mg'],
        allergies: ['Aspirin', 'NSAİD'],
        past_surgeries: ['Tiroid ameliyatı (2015)']
      },
      {
        full_name: 'Gülşah Öztürk',
        age: 31,
        birth_date: '1994-09-17',
        phone_number: '+90 535 567 8901',
        email: 'gulshah.ozturk@email.com',
        address: 'Bursa, Osmangazi, Setbaşı Caddesi',
        blood_type: 'AB',
        marital_status: 'Evli',
        occupation: 'Grafik Tasarımcı',
        emergency_contact_name: 'Abdullah Öztürk',
        emergency_contact_phone: '+90 535 567 8902',
        chronic_conditions: ['PCOS (Polikistik Over Sendromu)'],
        medications: ['Metformin 850mg', 'Spironolakton 100mg'],
        allergies: [],
        past_surgeries: []
      },
      {
        full_name: 'Neslihan Can',
        age: 38,
        birth_date: '1987-12-30',
        phone_number: '+90 536 901 2345',
        email: 'neslihan.can@email.com',
        address: 'Ankara, Keçiören, Aydınlar Mahallesi',
        blood_type: 'O',
        marital_status: 'Evli',
        occupation: 'Avukat',
        emergency_contact_name: 'Ahmet Can',
        emergency_contact_phone: '+90 536 901 2346',
        chronic_conditions: ['Endometriozis'],
        medications: ['Ibuprofen PRN'],
        allergies: ['Kodein'],
        past_surgeries: ['Laparoskopi (2019)']
      }
    ];

    // Medical records for each patient
    const medicalRecordsData = [
      // Ayşe Yılmaz - 3 muayene
      [
        {
          visit_date: '2025-12-15',
          visit_type: 'Rutin Kontrol',
          last_menstrual_date: '2025-12-01',
          menstrual_day: '14',
          complaint: 'Hafif karın ağrısı ve menstrüel tutulma',
          usg: 'Uterus ve over normal boyutlarda, sıvı yok',
          diagnosis: 'Primer dismenore',
          outcome: 'İbuprofen 400mg x 3 gün, ısı terapisi önerildi'
        },
        {
          visit_date: '2026-01-19',
          visit_type: 'Rutin Kontrol',
          last_menstrual_date: '2026-01-05',
          menstrual_day: '14',
          complaint: 'Şikayet yok, adet döngüsü düzenli',
          usg: 'Pelvik USG normal',
          diagnosis: 'Sağlıklı adet döngüsü',
          outcome: 'Devam eden tedavi yok, 1 ay sonra kontrol'
        },
        {
          visit_date: '2026-02-18',
          visit_type: 'Rutin Kontrol',
          last_menstrual_date: '2026-02-04',
          menstrual_day: '14',
          complaint: 'Hipertansiyon nedeniyle kan basıncı kontrolü',
          usg: 'Normal',
          diagnosis: 'Kontrollü hipertansiyon',
          outcome: 'Mevcut antihipertansif tedaviye devam, 2 ay sonra kontrol'
        }
      ],
      // Fatma Kaya - 2 muayene
      [
        {
          visit_date: '2026-01-12',
          visit_type: 'İlk Muayene',
          last_menstrual_date: '2025-12-28',
          menstrual_day: '15',
          complaint: 'Rutin jinekolojik muayene',
          usg: 'Pelvik USG normal, over normal',
          diagnosis: 'Sağlıklı',
          outcome: 'Kontrasepsiyon seçenekleri tartışıldı, KOK başlanması önerildi'
        },
        {
          visit_date: '2026-02-16',
          visit_type: 'Kontrol',
          last_menstrual_date: '2026-02-02',
          menstrual_day: '14',
          complaint: 'KOK kullanımı sonrası hafif bulantı',
          usg: 'Normal',
          diagnosis: 'KOK yan etkisi',
          outcome: 'Başka kontrasepsiyon seçeneği sunuldu, IUD yerleştirilmesi önerildi'
        }
      ],
      // Selin Demir - 3 muayene
      [
        {
          visit_date: '2025-11-20',
          visit_type: 'Rutin Kontrol',
          last_menstrual_date: '2025-11-10',
          menstrual_day: '10',
          complaint: 'Menopoz semptomları (sıcak basması)',
          usg: 'Uterus atrofik görünümde, over küçük',
          diagnosis: 'Perimenopoza girişte',
          outcome: 'HRT (Hormon Replasman Terapisi) başlanması önerildi, kalsiyum supplementi'
        },
        {
          visit_date: '2026-01-10',
          visit_type: 'Kontrol',
          last_menstrual_date: '2025-12-25',
          menstrual_day: '16',
          complaint: 'HRT başladıktan sonra belirtiler azaldı',
          usg: 'Endometriyal kalınlık 4.5mm (normal)',
          diagnosis: 'Menopoza girişte, HRT iyi tolere ediliyor',
          outcome: 'HRT tedaviye devam, 3 ay sonra kontrol'
        },
        {
          visit_date: '2026-02-17',
          visit_type: 'Kontrol',
          last_menstrual_date: 'N/A',
          menstrual_day: 'N/A',
          complaint: 'Kemik yoğunluğu kontrol için tarama',
          usg: 'Normal',
          diagnosis: 'Menopoza giriş, kemik yoğunluğu kontrol parametreleri normal',
          outcome: 'Dexa scan önerildi, HRT devam'
        }
      ],
      // Gülşah Öztürk - 2 muayene
      [
        {
          visit_date: '2026-01-15',
          visit_type: 'PCOS Takibi',
          last_menstrual_date: '2025-12-20',
          menstrual_day: '26',
          complaint: 'Düzensiz adet döngüsü, kilo alma',
          usg: 'Bilateral polikistik overler, endometriyal kalınlık 8mm',
          diagnosis: 'PCOS',
          outcome: 'Metformin doza arttırıldı, diyet-egzersiz danışmanı tavsiyesi'
        },
        {
          visit_date: '2026-02-12',
          visit_type: 'Kontrol',
          last_menstrual_date: '2026-01-25',
          menstrual_day: '18',
          complaint: 'Adet döngüsü biraz düzenlendi, hala kilo kaygısı',
          usg: 'Over hala polikistik görünümde, endometriyal kalınlık 7.5mm',
          diagnosis: 'PCOS, metformin tedavisi başında iyileşme',
          outcome: 'Tedaviye devam, 6 hafta sonra kan testleri, jinekoloji + endokrinoloji işbirliği'
        }
      ],
      // Neslihan Can - 3 muayene
      [
        {
          visit_date: '2025-12-10',
          visit_type: 'Endometriozis Kontrol',
          last_menstrual_date: '2025-11-25',
          menstrual_day: '15',
          complaint: 'Ağır menstrüel ağrı, defektede ağrı',
          usg: 'Endometrioma sol overde yaklaşık 2cm',
          diagnosis: 'Endometriozis (Evre III)',
          outcome: 'GnRH agonisti, NSAİD + paracetamol kombinasyonu, cerrahi danışmanlığı'
        },
        {
          visit_date: '2026-01-14',
          visit_type: 'Kontrol',
          last_menstrual_date: 'GnRH agonisti sonrası amentore',
          menstrual_day: 'N/A',
          complaint: 'GnRH agonisti tedavisi iyi tolere ediliyor (adet yok, ağrı yok)',
          usg: 'Endometrioma değişmemiş (2cm)',
          diagnosis: 'Endometriozis, GnRH agonisti tedavisi başında iyileşme',
          outcome: '6 ay daha GnRH agonisti, ardından hastayla tartışılarak cerrahi kararı'
        },
        {
          visit_date: '2026-02-14',
          visit_type: 'Kontrol',
          last_menstrual_date: 'Amentore (GnRH agonisti)',
          menstrual_day: 'N/A',
          complaint: 'Ağrı tamamen ortadan kalktı, kemik kaybı riskine dikkat',
          usg: 'Endometrioma stabil',
          diagnosis: 'Endometriozis Evre III, GnRH agonisti tedavisi başarılı',
          outcome: 'Osteoporoz riski için kalsiyum+D vitamini, GnRH agonisti sonrası seçenekkeri tartış'
        }
      ]
    ];

    // Add patients and their medical records
    for (let i = 0; i < testPatients.length; i++) {
      const patientData = testPatients[i];
      const patient = db.createPatient(patientData);
      
      console.log(`✅ Hasta ${i + 1} eklendi: ${patient.full_name} (${patient.patient_code})`);

      // Add medical records
      const records = medicalRecordsData[i];
      records.forEach((recordData, idx) => {
        const record = db.createMedicalRecord({
          patient_id: patient.id,
          ...recordData
        });
        console.log(`   ✓ Muayene ${idx + 1}: ${recordData.visit_date} - ${recordData.visit_type}`);
      });
      console.log('');
    }

    console.log('🎉 Tüm test hastaları ve muayeneleri başarıyla eklendi!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Hata:', err.message);
    process.exit(1);
  }
}

addTestPatients();
