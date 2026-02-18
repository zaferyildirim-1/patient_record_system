const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../clinic.db');
let db = null;

// Initialize database with schema
async function initializeDatabase() {
  const SQL = await initSqlJs();
  
  // Load existing database or create new
  let data = null;
  if (fs.existsSync(DB_PATH)) {
    data = fs.readFileSync(DB_PATH);
  }
  
  db = new SQL.Database(data);
  
  // Create tables if they don't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_code TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      age INTEGER,
      birth_date TEXT,
      phone_number TEXT,
      address TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      chronic_conditions TEXT,
      medications TEXT,
      allergies TEXT,
      past_surgeries TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS medical_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      visit_date TEXT NOT NULL,
      visit_order INTEGER,
      visit_type TEXT,
      visit_week TEXT,
      last_menstrual_date TEXT,
      menstrual_day TEXT,
      complaint TEXT,
      usg TEXT,
      diagnosis TEXT,
      outcome TEXT,
      additional_chronic_conditions TEXT,
      additional_medications TEXT,
      additional_allergies TEXT,
      additional_surgeries TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      table_name TEXT,
      record_id INTEGER,
      user_id INTEGER,
      old_data TEXT,
      new_data TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  saveDatabase();
  return db;
}

// Save database to file
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

// Generate unique patient code
function generatePatientCode() {
  const dateStr = new Date().toISOString().replace(/\D/g, '').substring(0, 8);
  
  // Get last patient code with today's date
  const result = db.exec(`
    SELECT MAX(CAST(SUBSTR(patient_code, 10) AS INTEGER)) as max_code 
    FROM patients 
    WHERE patient_code LIKE ?
  `, [`${dateStr}-%`]);
  
  let counter = 1;
  if (result.length > 0 && result[0].values.length > 0) {
    const maxCode = result[0].values[0][0];
    if (maxCode !== null) {
      counter = maxCode + 1;
    }
  }
  
  return `${dateStr}-${String(counter).padStart(3, '0')}`;
}

// Helper to convert arrays from/to JSON
function parseArrayField(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return value.split('\n').filter(x => x.trim());
    } catch {
      return [];
    }
  }
  return [];
}

function stringifyArrayField(arr) {
  if (!arr) return '';
  if (Array.isArray(arr)) return arr.join('\n');
  if (typeof arr === 'string') return arr;
  return '';
}

// PATIENTS - Create
function createPatient(patientData) {
  const code = generatePatientCode();
  
  db.run(`
    INSERT INTO patients (
      patient_code, full_name, age, birth_date, phone_number,
      address, emergency_contact_name, emergency_contact_phone,
      chronic_conditions, medications, allergies, past_surgeries
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    code,
    patientData.full_name,
    patientData.age,
    patientData.birth_date || null,
    patientData.phone_number || null,
    patientData.address || null,
    patientData.emergency_contact_name || null,
    patientData.emergency_contact_phone || null,
    stringifyArrayField(patientData.chronic_conditions),
    stringifyArrayField(patientData.medications),
    stringifyArrayField(patientData.allergies),
    stringifyArrayField(patientData.past_surgeries)
  ]);
  
  saveDatabase();
  
  // Get the inserted patient
  const result = db.exec(
    'SELECT * FROM patients WHERE patient_code = ?',
    [code]
  );
  
  if (result.length > 0 && result[0].values.length > 0) {
    return formatPatient(result[0], result[0].values[0]);
  }
  
  return null;
}

// PATIENTS - Get by ID
function getPatientById(id) {
  const result = db.exec(
    'SELECT * FROM patients WHERE id = ?',
    [id]
  );
  
  if (result.length > 0 && result[0].values.length > 0) {
    return formatPatient(result[0], result[0].values[0]);
  }
  
  return null;
}

// PATIENTS - Update
function updatePatient(id, patientData) {
  db.run(`
    UPDATE patients SET
      full_name = ?, age = ?, birth_date = ?, phone_number = ?,
      address = ?, emergency_contact_name = ?, emergency_contact_phone = ?,
      chronic_conditions = ?, medications = ?, allergies = ?, past_surgeries = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
    patientData.full_name,
    patientData.age,
    patientData.birth_date || null,
    patientData.phone_number || null,
    patientData.address || null,
    patientData.emergency_contact_name || null,
    patientData.emergency_contact_phone || null,
    stringifyArrayField(patientData.chronic_conditions),
    stringifyArrayField(patientData.medications),
    stringifyArrayField(patientData.allergies),
    stringifyArrayField(patientData.past_surgeries),
    id
  ]);
  
  saveDatabase();
  return getPatientById(id);
}

// PATIENTS - Get all
function getAllPatients() {
  const result = db.exec('SELECT * FROM patients ORDER BY created_at DESC');
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => formatPatient(result[0], row));
}

// Format patient result
function formatPatient(columns, row) {
  const patient = {};
  columns.columns.forEach((col, idx) => {
    patient[col] = row[idx];
  });
  
  // Parse array fields
  patient.chronic_conditions = parseArrayField(patient.chronic_conditions);
  patient.medications = parseArrayField(patient.medications);
  patient.allergies = parseArrayField(patient.allergies);
  patient.past_surgeries = parseArrayField(patient.past_surgeries);
  
  return patient;
}

// MEDICAL_RECORDS - Create
function createMedicalRecord(recordData) {
  // Get highest visit_order for this patient
  const result = db.exec(
    'SELECT MAX(visit_order) as max_order FROM medical_records WHERE patient_id = ?',
    [recordData.patient_id]
  );
  
  let visitOrder = 1;
  if (result.length > 0 && result[0].values[0][0] !== null) {
    visitOrder = result[0].values[0][0] + 1;
  }
  
  db.run(`
    INSERT INTO medical_records (
      patient_id, visit_date, visit_order, visit_type, visit_week,
      last_menstrual_date, menstrual_day, complaint, usg, diagnosis, outcome,
      additional_chronic_conditions, additional_medications,
      additional_allergies, additional_surgeries
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    recordData.patient_id,
    recordData.visit_date,
    visitOrder,
    recordData.visit_type || null,
    recordData.visit_week || null,
    recordData.last_menstrual_date || null,
    recordData.menstrual_day || null,
    recordData.complaint || null,
    recordData.usg || null,
    recordData.diagnosis || null,
    recordData.outcome || null,
    recordData.additional_chronic_conditions || null,
    recordData.additional_medications || null,
    recordData.additional_allergies || null,
    recordData.additional_surgeries || null
  ]);
  
  saveDatabase();
  
  // Get the last inserted record
  const lastRecord = db.exec(
    'SELECT * FROM medical_records WHERE patient_id = ? ORDER BY id DESC LIMIT 1',
    [recordData.patient_id]
  );
  
  if (lastRecord.length > 0 && lastRecord[0].values.length > 0) {
    return formatMedicalRecord(lastRecord[0], lastRecord[0].values[0]);
  }
  
  return null;
}

// MEDICAL_RECORDS - Get by ID
function getMedicalRecordById(id) {
  const result = db.exec(
    'SELECT * FROM medical_records WHERE id = ?',
    [id]
  );
  
  if (result.length > 0 && result[0].values.length > 0) {
    return formatMedicalRecord(result[0], result[0].values[0]);
  }
  
  return null;
}

// MEDICAL_RECORDS - Update
function updateMedicalRecord(id, recordData) {
  db.run(`
    UPDATE medical_records SET
      visit_type = ?, visit_week = ?, last_menstrual_date = ?,
      menstrual_day = ?, complaint = ?, usg = ?, diagnosis = ?, outcome = ?,
      additional_chronic_conditions = ?, additional_medications = ?,
      additional_allergies = ?, additional_surgeries = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [
    recordData.visit_type || null,
    recordData.visit_week || null,
    recordData.last_menstrual_date || null,
    recordData.menstrual_day || null,
    recordData.complaint || null,
    recordData.usg || null,
    recordData.diagnosis || null,
    recordData.outcome || null,
    recordData.additional_chronic_conditions || null,
    recordData.additional_medications || null,
    recordData.additional_allergies || null,
    recordData.additional_surgeries || null,
    id
  ]);
  
  saveDatabase();
  return getMedicalRecordById(id);
}

// MEDICAL_RECORDS - Get all by patient
function getMedicalRecordsByPatientId(patientId) {
  const result = db.exec(
    'SELECT * FROM medical_records WHERE patient_id = ? ORDER BY visit_order DESC',
    [patientId]
  );
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => formatMedicalRecord(result[0], row));
}

// Format medical record result
function formatMedicalRecord(columns, row) {
  const record = {};
  columns.columns.forEach((col, idx) => {
    record[col] = row[idx];
  });
  return record;
}

// Export functions
module.exports = {
  initializeDatabase,
  saveDatabase,
  
  // Patients
  createPatient,
  getPatientById,
  updatePatient,
  getAllPatients,
  
  // Medical Records
  createMedicalRecord,
  getMedicalRecordById,
  updateMedicalRecord,
  getMedicalRecordsByPatientId,
  
  // Getters
  getDb: () => db
};