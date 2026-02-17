const db = require('your-db-connection');

// Patients table schema 
const patientsSchema = `CREATE TABLE patients ( 
    id SERIAL PRIMARY KEY, 
    name VARCHAR(255) NOT NULL, 
    blood_type VARCHAR(10), 
    allergies TEXT[], 
    chronic_conditions TEXT[], 
    emergency_contact VARCHAR(255) 
);`;

// Medical Records table schema 
const medicalRecordsSchema = `CREATE TABLE medical_records ( 
    id SERIAL PRIMARY KEY, 
    patient_id INTEGER REFERENCES patients(id), 
    blood_pressure VARCHAR(10), 
    body_temperature DECIMAL(5, 2), 
    heart_rate INTEGER, 
    respiratory_rate INTEGER, 
    weight DECIMAL(5, 2), 
    height DECIMAL(5, 2), 
    prescribed_medications TEXT[], 
    current_medications TEXT[], 
    contraindications TEXT[], 
    usg_measurements TEXT, 
    physical_examination TEXT, 
    lab_results TEXT, 
    follow_up_date DATE, 
    follow_up_notes TEXT, 
    visit_status VARCHAR(50) 
);`;

// Audit Logs table schema for KVKK compliance 
const auditLogsSchema = `CREATE TABLE audit_logs ( 
    id SERIAL PRIMARY KEY, 
    action VARCHAR(255), 
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    user VARCHAR(255), 
    details TEXT 
);`;

// Function to log audit events
const logAudit = (action, user, details) => { 
    const query = `INSERT INTO audit_logs (action, user, details) VALUES ($1, $2, $3)`; 
    const values = [action, user, details]; 
    db.query(query, values); 
};

// Updated createPatient function with audit logging support
const createPatient = (patientData) => { 
    const query = `INSERT INTO patients (name, blood_type, allergies, chronic_conditions, emergency_contact) VALUES ($1, $2, $3, $4, $5) RETURNING id`; 
    const values = [patientData.name, patientData.blood_type, patientData.allergies, patientData.chronic_conditions, patientData.emergency_contact]; 
    db.query(query, values, (err, res) => { 
        if (err) throw err; 
        logAudit('Created patient', 'zaferyildirim-1', `Patient ID: ${res.rows[0].id}`); 
    }); 
};

// Updated createRecord function with audit logging support
const createRecord = (recordData) => { 
    const query = `INSERT INTO medical_records (patient_id, blood_pressure, body_temperature, heart_rate, respiratory_rate, weight, height, prescribed_medications, current_medications, contraindications, usg_measurements, physical_examination, lab_results, follow_up_date, follow_up_notes, visit_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`; 
    const values = [recordData.patient_id, recordData.blood_pressure, recordData.body_temperature, recordData.heart_rate, recordData.respiratory_rate, recordData.weight, recordData.height, recordData.prescribed_medications, recordData.current_medications, recordData.contraindications, recordData.usg_measurements, recordData.physical_examination, recordData.lab_results, recordData.follow_up_date, recordData.follow_up_notes, recordData.visit_status]; 
    db.query(query, values, (err) => { 
        if (err) throw err; 
        logAudit('Created medical record', 'zaferyildirim-1', `Patient ID: ${recordData.patient_id}`); 
    }); 
};

module.exports = { createPatient, createRecord, logAudit };