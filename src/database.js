const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '..', 'clinic.db');
const SALT_ROUNDS = 10;

let SQL; // Holds sql.js module instance
let db; // Holds open database connection

async function ensureDatabase() {
  if (!SQL) {
    SQL = await initSqlJs();
  }

  if (!db) {
    const data = fs.existsSync(dbPath) ? fs.readFileSync(dbPath) : null;
    db = data ? new SQL.Database(new Uint8Array(data)) : new SQL.Database();

    db.run('PRAGMA foreign_keys = ON;');

    // Patients table - temiz şema
    db.run(`
      CREATE TABLE IF NOT EXISTS patients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_code TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        age INTEGER NOT NULL,
        birth_date TEXT,
        phone_number TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // Medical records table
    db.run(`
      CREATE TABLE IF NOT EXISTS medical_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        visit_date TEXT NOT NULL,
        visit_order INTEGER NOT NULL DEFAULT 0,
        visit_type TEXT,
        visit_week TEXT,
        last_menstrual_date TEXT,
        menstrual_day TEXT,
        complaint TEXT,
        usg TEXT,
        diagnosis TEXT,
        outcome TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
      );
    `);

    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    await ensureDefaultUser();
  }
}

function persist() {
  if (!db) {
    return;
  }
  const data = Buffer.from(db.export());
  fs.writeFileSync(dbPath, data);
}

function queryAll(sql, params = {}) {
  const stmt = db.prepare(sql, params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function queryOne(sql, params = {}) {
  const stmt = db.prepare(sql, params);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

function queryValue(sql, params = {}, fallback = null) {
  const row = queryOne(sql, params);
  if (!row) {
    return fallback;
  }
  const key = Object.keys(row)[0];
  return row[key];
}

function toDatePrefix(value) {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value.replace(/-/g, '');
  }

  const fallback = value ? new Date(value) : new Date();
  if (Number.isNaN(fallback.getTime())) {
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0')
    ].join('');
  }

  return [
    fallback.getFullYear(),
    String(fallback.getMonth() + 1).padStart(2, '0'),
    String(fallback.getDate()).padStart(2, '0')
  ].join('');
}

function generatePatientCode(visitDate) {
  const prefix = toDatePrefix(visitDate);
  const row = queryOne(
    `SELECT patient_code FROM patients WHERE patient_code LIKE :pattern ORDER BY patient_code DESC LIMIT 1`,
    { ':pattern': `${prefix}-%` }
  );

  let next = 1;
  if (row && row.patient_code) {
    const parts = row.patient_code.split('-');
    const last = Number(parts[1]);
    if (!Number.isNaN(last)) {
      next = last + 1;
    }
  }

  return `${prefix}-${String(next).padStart(3, '0')}`;
}

function computeVisitWeek(value) {
  const ref = value ? new Date(value) : new Date();
  if (Number.isNaN(ref.getTime())) {
    return null;
  }

  const date = new Date(Date.UTC(ref.getFullYear(), ref.getMonth(), ref.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  const year = date.getUTCFullYear();
  return `${year}-W${String(weekNo).padStart(2, '0')}`;
}

function nextVisitOrder(patientId) {
  const currentMax = Number(
    queryValue(
      'SELECT MAX(visit_order) AS max_order FROM medical_records WHERE patient_id = :patient_id',
      { ':patient_id': Number(patientId) },
      0
    )
  ) || 0;
  return currentMax + 1;
}

module.exports = {
  async init() {
    await ensureDatabase();
  },

  listPatients(filters = {}) {
    const clauses = [];
    const params = {};

    if (filters.patient_code) {
      const value = String(filters.patient_code).trim();
      if (value) {
        clauses.push('p.patient_code LIKE :patient_code');
        params[':patient_code'] = `%${value}%`;
      }
    }

    if (filters.full_name) {
      const value = String(filters.full_name).trim();
      if (value) {
        clauses.push('LOWER(p.full_name) LIKE :full_name');
        params[':full_name'] = `%${value.toLowerCase()}%`;
      }
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

    // Optimized: Single query with LEFT JOIN instead of correlated subqueries
    return queryAll(
      `
      SELECT p.*, 
        COUNT(mr.id) AS record_count,
        MAX(mr.visit_date) AS last_visit
      FROM patients p
      LEFT JOIN medical_records mr ON mr.patient_id = p.id
      ${where}
      GROUP BY p.id
      ORDER BY p.updated_at DESC, p.id DESC
    `,
      params
    );
  },

  listTodayPatients() {
    return queryAll(`
      SELECT p.*,
        (SELECT COUNT(*) FROM medical_records mr WHERE mr.patient_id = p.id) AS record_count,
        (SELECT MAX(visit_date) FROM medical_records mr WHERE mr.patient_id = p.id) AS last_visit,
        (SELECT visit_date FROM medical_records mr 
         WHERE mr.patient_id = p.id AND mr.visit_date < date('now', 'localtime')
         ORDER BY visit_date DESC LIMIT 1) AS previous_visit,
        (SELECT created_at FROM medical_records mr 
         WHERE mr.patient_id = p.id AND mr.visit_date = date('now', 'localtime') 
         ORDER BY created_at DESC LIMIT 1) AS today_record_time
      FROM patients p
      WHERE EXISTS (
        SELECT 1 FROM medical_records mr
        WHERE mr.patient_id = p.id AND mr.visit_date = date('now', 'localtime')
      )
      ORDER BY today_record_time DESC
    `);
  },
  getPatientByCode(patientCode) {
    return queryOne(
      'SELECT * FROM patients WHERE patient_code = :patient_code',
      { ':patient_code': patientCode }
    );
  },
  getPatient(id) {
    return queryOne('SELECT * FROM patients WHERE id = :id', { ':id': Number(id) });
  },

  createPatient(data) {
    const today = new Date().toISOString().split('T')[0];
    const patientCode = generatePatientCode(today);
    const stmt = db.prepare(`
      INSERT INTO patients (patient_code, full_name, age, birth_date, phone_number, created_at, updated_at)
      VALUES (:patient_code, :full_name, :age, :birth_date, :phone_number, datetime('now'), datetime('now'))
    `);
    stmt.run({
      ':patient_code': patientCode,
      ':full_name': data.full_name,
      ':age': data.age,
      ':birth_date': data.birth_date || null,
      ':phone_number': data.phone_number || null
    });
    stmt.free();

    const idRow = queryOne('SELECT last_insert_rowid() AS id');
    persist();
    return idRow?.id;
  },

  updatePatient(id, data) {
    const stmt = db.prepare(`
      UPDATE patients
      SET full_name = :full_name,
          age = :age,
          birth_date = :birth_date,
          phone_number = :phone_number,
          updated_at = datetime('now')
      WHERE id = :id
    `);
    stmt.run({
      ':full_name': data.full_name,
      ':age': data.age,
      ':birth_date': data.birth_date || null,
      ':phone_number': data.phone_number || null,
      ':id': Number(id)
    });
    stmt.free();
    persist();
  },

  deletePatient(id) {
    const stmt = db.prepare('DELETE FROM patients WHERE id = :id');
    stmt.run({ ':id': Number(id) });
    stmt.free();
    persist();
  },

    listRecords(patientId) {
      return queryAll(
        `SELECT * FROM medical_records WHERE patient_id = :patient_id ORDER BY visit_date DESC, id DESC`,
        { ':patient_id': Number(patientId) }
      );
  },

  createRecord(patientId, data) {
    const order = nextVisitOrder(patientId);
    const week = computeVisitWeek(data.visit_date);
    const stmt = db.prepare(`
      INSERT INTO medical_records (patient_id, visit_date, visit_order, visit_type, visit_week, last_menstrual_date, menstrual_day, complaint, usg, diagnosis, outcome, created_at, updated_at)
      VALUES (:patient_id, :visit_date, :visit_order, :visit_type, :visit_week, :last_menstrual_date, :menstrual_day, :complaint, :usg, :diagnosis, :outcome, datetime('now'), datetime('now'))
    `);
    stmt.run({
      ':patient_id': Number(patientId),
      ':visit_date': data.visit_date,
      ':visit_order': order,
      ':visit_type': data.visit_type || null,
      ':visit_week': week,
      ':last_menstrual_date': data.last_menstrual_date || null,
      ':menstrual_day': data.menstrual_day || null,
      ':complaint': data.complaint || '',
      ':usg': data.usg || '',
      ':diagnosis': data.diagnosis || '',
      ':outcome': data.outcome || ''
    });
    stmt.free();
    persist();
  },

  createMedicalRecord(data) {
    const stmt = db.prepare(`
      INSERT INTO medical_records (patient_id, visit_date, visit_order, visit_type, visit_week, last_menstrual_date, menstrual_day, complaint, usg, diagnosis, outcome, created_at, updated_at)
      VALUES (:patient_id, :visit_date, :visit_order, :visit_type, :visit_week, :last_menstrual_date, :menstrual_day, :complaint, :usg, :diagnosis, :outcome, datetime('now'), datetime('now'))
    `);
    stmt.run({
      ':patient_id': Number(data.patient_id),
      ':visit_date': data.visit_date || null,
      ':visit_order': data.visit_order || null,
      ':visit_type': data.visit_type || null,
      ':visit_week': data.visit_week || null,
      ':last_menstrual_date': data.last_menstrual_date || null,
      ':menstrual_day': data.menstrual_day || null,
      ':complaint': data.complaint || '',
      ':usg': data.usg || '',
      ':diagnosis': data.diagnosis || '',
      ':outcome': data.outcome || ''
    });
    stmt.free();
    persist();
  },

  deleteRecord(recordId) {
    const stmt = db.prepare('DELETE FROM medical_records WHERE id = :id');
    stmt.run({ ':id': Number(recordId) });
    stmt.free();
    persist();
  },

  getRecord(recordId) {
    return queryOne('SELECT * FROM medical_records WHERE id = :id', { ':id': Number(recordId) });
  },

  updateRecord(recordId, data) {
    const stmt = db.prepare(`
      UPDATE medical_records
      SET visit_date = :visit_date,
          visit_type = :visit_type,
          last_menstrual_date = :last_menstrual_date,
          menstrual_day = :menstrual_day,
          complaint = :complaint,
          usg = :usg,
          diagnosis = :diagnosis,
          outcome = :outcome,
          updated_at = datetime('now')
      WHERE id = :id
    `);
    stmt.run({
      ':id': Number(recordId),
      ':visit_date': data.visit_date,
      ':visit_type': data.visit_type || null,
      ':last_menstrual_date': data.last_menstrual_date || null,
      ':menstrual_day': data.menstrual_day || null,
      ':complaint': data.complaint || '',
      ':usg': data.usg || '',
      ':diagnosis': data.diagnosis || '',
      ':outcome': data.outcome || ''
    });
    stmt.free();
    persist();
  },

  getStats() {
    const totalPatients = queryValue('SELECT COUNT(*) AS count FROM patients', {}, 0);
    const totalRecords = queryValue('SELECT COUNT(*) AS count FROM medical_records', {}, 0);
    const latestVisit = queryValue(
      'SELECT visit_date FROM medical_records ORDER BY visit_date DESC LIMIT 1',
      {},
      null
    );
    const todayPatients = queryValue(
      `SELECT COUNT(DISTINCT patient_id) AS count 
       FROM medical_records 
       WHERE visit_date = date('now')`,
      {},
      0
    );
    const weekRecords = queryValue(
      "SELECT COUNT(*) AS count FROM medical_records WHERE visit_date >= date('now','-7 day')",
      {},
      0
    );
    const latestPatient = queryOne(
      'SELECT p.full_name, p.patient_code, p.created_at FROM patients p ORDER BY p.created_at DESC LIMIT 1'
    );
    const recentRecords = queryAll(`
      SELECT mr.id, mr.visit_date, mr.diagnosis, mr.outcome, p.full_name
      FROM medical_records mr
      JOIN patients p ON p.id = mr.patient_id
      ORDER BY mr.visit_date DESC, mr.id DESC
      LIMIT 5
    `);

    return {
      totalPatients,
      totalRecords,
      latestVisit,
      todayPatients,
      weekRecords,
      latestPatient,
      recentRecords
    };
  },

  // User management functions
  async findUserByUsername(username) {
    return queryOne('SELECT * FROM users WHERE username = :username', { ':username': username });
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  async changePassword(username, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const stmt = db.prepare(`
      UPDATE users 
      SET password_hash = :password_hash, updated_at = datetime('now')
      WHERE username = :username
    `);
    stmt.run({ 
      ':password_hash': passwordHash,
      ':username': username 
    });
    stmt.free();
    persist();
  }
}

async function ensureDefaultUser() {
  // Security: Require APP_USER and APP_PASSWORD from environment
  if (!process.env.APP_USER || !process.env.APP_PASSWORD) {
    console.error('FATAL: APP_USER and APP_PASSWORD environment variables are required!');
    console.error('Set them in .env file before starting the application.');
    process.exit(1);
  }

  const username = process.env.APP_USER;
  const password = process.env.APP_PASSWORD;

  const existingUser = queryOne('SELECT * FROM users WHERE username = :username', { ':username': username });
  
  if (!existingUser) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const stmt = db.prepare(`
      INSERT INTO users (username, password_hash, created_at, updated_at)
      VALUES (:username, :password_hash, datetime('now'), datetime('now'))
    `);
    stmt.run({
      ':username': username,
      ':password_hash': passwordHash
    });
    stmt.free();
    persist();
    console.log(`✅ Default user '${username}' created successfully.`);
  }
}