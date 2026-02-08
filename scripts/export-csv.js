'use strict';

const fs = require('fs');
const path = require('path');
const db = require('../src/database');

const BACKUP_DIR = path.join(__dirname, '..', 'backups');

function pad(value) {
  return String(value).padStart(2, '0');
}

function timestampSuffix() {
  const now = new Date();
  const datePart = [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join('-');
  const timePart = [pad(now.getHours()), pad(now.getMinutes())].join('-');
  return `${datePart}_${timePart}`;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function escapeCsv(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  if (!/[",\n]/.test(stringValue)) {
    return stringValue;
  }
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function toCsv(headers, rows) {
  const headerLine = headers.join(',');
  const dataLines = rows.map((row) => headers.map((key) => escapeCsv(row[key])).join(','));
  return [headerLine, ...dataLines].join('\n');
}

(async () => {
  try {
    await db.init();

    ensureDir(BACKUP_DIR);

    const scheduleArg = process.argv[2] && String(process.argv[2]).trim();
    const scheduleEnv = process.env.BACKUP_SCHEDULE && String(process.env.BACKUP_SCHEDULE).trim();
    const scheduleName = (scheduleEnv || scheduleArg || 'manual').toLowerCase();

    const targetDir = path.join(BACKUP_DIR, scheduleName);
    ensureDir(targetDir);

    const suffix = timestampSuffix();

    const patients = db.listPatients();
    const patientHeaders = [
      'id',
      'patient_code',
      'full_name',
      'age',
      'birth_date',
      'phone_number',
      'created_at',
      'updated_at',
      'record_count',
      'last_visit'
    ];

    const patientCsv = toCsv(
      patientHeaders,
      patients.map((patient) => patient)
    );

    const patientFile = path.join(targetDir, `patients-${suffix}.csv`);
    fs.writeFileSync(patientFile, `${patientCsv}\n`, 'utf8');

    const recordHeaders = [
      'id',
      'patient_id',
      'patient_code',
      'patient_name',
      'visit_date',
      'visit_order',
      'visit_week',
      'visit_type',
      'complaint',
      'diagnosis',
      'outcome',
      'created_at',
      'updated_at'
    ];

    const recordRows = [];

    patients.forEach((patient) => {
      const records = db.listRecords(patient.id);
      records.forEach((record) => {
        recordRows.push({
          ...record,
          patient_code: patient.patient_code,
          patient_name: patient.full_name
        });
      });
    });

    const recordCsv = toCsv(recordHeaders, recordRows);
    const recordFile = path.join(targetDir, `medical-records-${suffix}.csv`);
    fs.writeFileSync(recordFile, `${recordCsv}\n`, 'utf8');

    console.log(`CSV yedekleme (${scheduleName}) tamamlandi:`);
    console.log(`- ${patientFile}`);
    console.log(`- ${recordFile}`);
  } catch (error) {
    console.error('CSV yedekleme sirasinda hata olustu:', error);
    process.exitCode = 1;
  }
})();
