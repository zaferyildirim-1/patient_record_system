const fs = require('fs');
const path = require('path');
const db = require('../src/database');

async function importFromCSV(patientsFile, recordsFile) {
  console.log('🔄 CSV\'den veri geri yükleme başlıyor...\n');

  await db.init();
  
  // Read CSV files
  const patientsCSV = fs.readFileSync(patientsFile, 'utf-8');
  const recordsCSV = fs.readFileSync(recordsFile, 'utf-8');
  
  // Parse patients CSV
  const patientLines = patientsCSV.trim().split('\n');
  const patientHeaders = patientLines[0].split(',');
  
  console.log('📋 Hasta bilgileri okunuyor...');
  const patientMap = {}; // old_id -> new_id mapping
  
  for (let i = 1; i < patientLines.length; i++) {
    const line = patientLines[i];
    const values = parseCSVLine(line);
    
    if (values.length < 8) continue;
    
    const [oldId, patient_code, national_id, full_name, age, visit_date, created_at, updated_at] = values;
    
    // Check if patient already exists by patient_code
    const existing = db.getPatientByCode(patient_code);
    
    if (existing) {
      console.log(`  ✓ Hasta zaten var: ${patient_code} - ${full_name}`);
      patientMap[oldId] = existing.id;
    } else {
      console.log(`  ⚠️  Hasta bulunamadı: ${patient_code} - ${full_name} (yeni oluşturulmalı)`);
    }
  }
  
  // Parse medical records CSV
  const recordLines = recordsCSV.trim().split('\n');
  const recordHeaders = recordLines[0].split(',');
  
  console.log('\n🏥 Muayene kayıtları ekleniyor...');
  let addedCount = 0;
  
  for (let i = 1; i < recordLines.length; i++) {
    const line = recordLines[i];
    const values = parseCSVLine(line);
    
    if (values.length < 13) continue;
    
    const [
      oldRecordId,
      oldPatientId,
      patient_code,
      patient_name,
      visit_date,
      visit_order,
      visit_week,
      visit_type,
      complaint,
      diagnosis,
      outcome,
      created_at,
      updated_at
    ] = values;
    
    // Get patient by code
    const patient = db.getPatientByCode(patient_code);
    
    if (patient) {
      try {
        db.createMedicalRecord({
          patient_id: patient.id,
          visit_date: visit_date || null,
          visit_order: parseInt(visit_order) || null,
          visit_week: visit_week || null,
          visit_type: visit_type || '',
          complaint: complaint || '',
          diagnosis: diagnosis || '',
          outcome: outcome || ''
        });
        console.log(`  ✓ Kayıt eklendi: ${patient_code} - ${visit_date} (${visit_order}. ziyaret)`);
        addedCount++;
      } catch (err) {
        console.log(`  ✗ Hata: ${patient_code} - ${err.message}`);
      }
    } else {
      console.log(`  ✗ Hasta bulunamadı: ${patient_code}`);
    }
  }
  
  console.log(`\n✅ Tamamlandı! ${addedCount} muayene kaydı geri yüklendi.`);
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  
  return values;
}

// Run import
const patientsFile = process.argv[2] || path.join(__dirname, '../backups/patients-2026-01-26_17-19.csv');
const recordsFile = process.argv[3] || path.join(__dirname, '../backups/medical-records-2026-01-26_17-19.csv');

importFromCSV(patientsFile, recordsFile)
  .then(() => {
    console.log('\n🎉 Veri geri yükleme işlemi tamamlandı!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Hata:', err);
    process.exit(1);
  });
