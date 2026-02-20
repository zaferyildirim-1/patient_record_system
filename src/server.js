// dotenv already configured in main.js for Electron, or configure here for Node
try {
  require('dotenv').config();
} catch (e) {
  // Already configured
}

const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const app = express();
const db = require('./database');

// Determine sessions directory based on environment variable (set by main.js) or development path
const sessionsDir = process.env.SESSIONS_DIR || path.join(__dirname, '../.sessions');

// Middleware setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Create sessions directory if it doesn't exist
try {
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
  }
} catch (err) {
  console.error('Error creating sessions directory:', err.message);
  // Continue anyway, will fail gracefully if directory is needed
}

// Session configuration
const sessionSecret = process.env.SESSION_SECRET || 'dev-secret-change-in-production';
app.use(session({
  store: new FileStore({ path: sessionsDir, ttl: 24 * 60 * 60 }),
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 12 * 60 * 60 * 1000 } // 12 hours
}));

// Initialize database on startup
(async () => {
  try {
    await db.initializeDatabase();
    console.log('✅ Database initialized');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
    process.exit(1);
  }
})();

// Authentication Middleware
function requireAuth(req, res, next) {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  next();
}

// Routes

// GET /login - Login page
app.get('/login', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/');
  }
  res.render('login', { error: null, username: '' });
});

// POST /login - Handle login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.render('login', { error: 'Kullanıcı adı ve şifre gerekli', username: username || '' });
  }
  
  // Simple validation - in production use actual user database
  const appUser = process.env.APP_USER || 'admin';
  const appPass = process.env.APP_PASSWORD || 'password';
  
  if (username === appUser && password === appPass) {
    req.session.user_id = 1;
    req.session.username = username;
    return res.redirect('/');
  }
  
  res.render('login', { error: 'Geçersiz kullanıcı adı veya şifre', username: username || '' });
});

// GET / - Home page
app.get('/', requireAuth, (req, res) => {
  const patients = db.getAllPatients();
  
  // Calculate statistics
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Today's patients (empty list for now - no appointment system)
  const todayPatients = [];
  
  // Count records from week
  let weekRecords = 0;
  patients.forEach(patient => {
    const records = db.getMedicalRecordsByPatientId(patient.id);
    records.forEach(record => {
      if (record.visit_date >= weekAgo) {
        weekRecords++;
      }
    });
  });
  
  // Get all records for total count
  let totalRecords = 0;
  patients.forEach(patient => {
    const records = db.getMedicalRecordsByPatientId(patient.id);
    totalRecords += records.length;
  });
  
  // Latest patient
  const latestPatient = patients.length > 0 ? patients[0] : null;
  
  const stats = {
    totalPatients: patients.length,
    todayPatients: todayPatients.length,
    weekRecords,
    latestPatient,
    totalRecords
  };
  
  res.render('home', { 
    todayPatients,
    stats,
    username: req.session.username,
    formatDate: (date) => {
      if (!date) return '-';
      const d = new Date(date);
      return d.toLocaleDateString('tr-TR');
    }
  });
});

// GET /patients - Patients list with search/filter
app.get('/patients', requireAuth, (req, res) => {
  let patients = db.getAllPatients();
  const today = new Date().toISOString().split('T')[0];

  const isIsoDate = (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const getLastVisitBeforeToday = (records) => {
    let last = null;
    for (const record of records) {
      const d = record?.visit_date;
      if (!isIsoDate(d)) continue;
      if (d >= today) continue; // strictly before today
      if (!last || d > last) last = d;
    }
    return last;
  };
  
  // Apply filters from query parameters
  const filters = {
    patient_code: req.query.patient_code?.trim() || '',
    full_name: req.query.full_name?.trim() || ''
  };
  
  const hasFilters = filters.patient_code || filters.full_name;
  
  if (hasFilters) {
    patients = patients.filter(patient => {
      const codeMatch = !filters.patient_code || 
        patient.patient_code.toLowerCase().includes(filters.patient_code.toLowerCase());
      const nameMatch = !filters.full_name || 
        patient.full_name.toLowerCase().includes(filters.full_name.toLowerCase());
      return codeMatch && nameMatch;
    });
  }
  
  // Add record counts to each patient for display
  patients.forEach(patient => {
    const records = db.getMedicalRecordsByPatientId(patient.id);
    patient.record_count = records.length;
    patient.last_visit = getLastVisitBeforeToday(records);
  });
  
  res.render('patients/index', { 
    patients,
    username: req.session.username,
    filters,
    hasFilters,
    formatDate: (date) => {
      if (!date) return '-';
      const d = new Date(date);
      return d.toLocaleDateString('tr-TR');
    }
  });
});

// GET /patients/new - New patient form
app.get('/patients/new', requireAuth, (req, res) => {
  res.render('patients/form', {
    action: '/patients',
    method: 'POST',
    title: 'Yeni Hastayı Kaydet',
    patient: null,
    errors: [],
    username: req.session.username
  });
});

// POST /patients - Create patient
app.post('/patients', requireAuth, (req, res) => {
  const errors = [];
  
  if (!req.body.full_name || req.body.full_name.trim().length === 0) {
    errors.push('Ad Soyad gerekli');
  }
  if (!req.body.age || isNaN(req.body.age) || req.body.age < 0 || req.body.age > 150) {
    errors.push('Geçerli bir yaş girin');
  }
  
  if (errors.length > 0) {
    return res.render('patients/form', {
      action: '/patients',
      method: 'POST',
      title: 'Yeni Hastayı Kaydet',
      patient: req.body,
      errors,
      username: req.session.username
    });
  }
  
  try {
    const patient = db.createPatient({
      full_name: req.body.full_name.trim(),
      age: parseInt(req.body.age),
      birth_date: req.body.birth_date || null,
      phone_number: req.body.phone_number || null,
      email: req.body.email || null,
      address: req.body.address || null,
      blood_type: req.body.blood_type || null,
      marital_status: req.body.marital_status || null,
      occupation: req.body.occupation || null,
      emergency_contact_name: req.body.emergency_contact_name || null,
      emergency_contact_phone: req.body.emergency_contact_phone || null,
      chronic_conditions: req.body.chronic_conditions ? req.body.chronic_conditions.split('\n') : [],
      medications: req.body.medications ? req.body.medications.split('\n') : [],
      allergies: req.body.allergies ? req.body.allergies.split('\n') : [],
      past_surgeries: req.body.past_surgeries ? req.body.past_surgeries.split('\n') : []
    });
    
    res.redirect(`/patients/${patient.id}`);
  } catch (err) {
    console.error('Create patient error:', err);
    errors.push('Hasta kaydı sırasında hata oluştu');
    res.render('patients/form', {
      action: '/patients',
      method: 'POST',
      title: 'Yeni Hastayı Kaydet',
      patient: req.body,
      errors,
      username: req.session.username
    });
  }
});

// GET /patients/:id - Patient detail page
app.get('/patients/:id', requireAuth, (req, res) => {
  const patient = db.getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).render('not-found', { message: 'Hasta bulunamadı' });
  }
  
  const records = db.getMedicalRecordsByPatientId(patient.id);
  res.render('patients/detail', {
    patient,
    records,
    username: req.session.username
  });
});

// GET /patients/:id/edit - Edit patient
app.get('/patients/:id/edit', requireAuth, (req, res) => {
  const patient = db.getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).render('not-found', { message: 'Hasta bulunamadı' });
  }
  
  res.render('patients/form', {
    action: `/patients/${patient.id}/update`,
    method: 'POST',
    title: 'Hasta Bilgilerini Düzenle',
    patient,
    errors: [],
    username: req.session.username
  });
});

// POST /patients/:id/update - Update patient
app.post('/patients/:id/update', requireAuth, (req, res) => {
  const patient = db.getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).render('not-found', { message: 'Hasta bulunamadı' });
  }
  
  const errors = [];
  
  if (!req.body.full_name || req.body.full_name.trim().length === 0) {
    errors.push('Ad Soyad gerekli');
  }
  if (!req.body.age || isNaN(req.body.age) || req.body.age < 0 || req.body.age > 150) {
    errors.push('Geçerli bir yaş girin');
  }
  
  if (errors.length > 0) {
    return res.render('patients/form', {
      action: `/patients/${patient.id}/update`,
      method: 'POST',
      title: 'Hasta Bilgilerini Düzenle',
      patient: req.body,
      errors,
      username: req.session.username
    });
  }
  
  try {
    db.updatePatient(patient.id, {
      full_name: req.body.full_name.trim(),
      age: parseInt(req.body.age),
      birth_date: req.body.birth_date || null,
      phone_number: req.body.phone_number || null,
      email: req.body.email || null,
      address: req.body.address || null,
      blood_type: req.body.blood_type || null,
      marital_status: req.body.marital_status || null,
      occupation: req.body.occupation || null,
      emergency_contact_name: req.body.emergency_contact_name || null,
      emergency_contact_phone: req.body.emergency_contact_phone || null,
      chronic_conditions: req.body.chronic_conditions ? req.body.chronic_conditions.split('\n') : [],
      medications: req.body.medications ? req.body.medications.split('\n') : [],
      allergies: req.body.allergies ? req.body.allergies.split('\n') : [],
      past_surgeries: req.body.past_surgeries ? req.body.past_surgeries.split('\n') : []
    });
    
    res.redirect(`/patients/${patient.id}`);
  } catch (err) {
    console.error('Update patient error:', err);
    errors.push('Güncelleme sırasında hata oluştu');
    res.render('patients/form', {
      action: `/patients/${patient.id}/update`,
      method: 'POST',
      title: 'Hasta Bilgilerini Düzenle',
      patient: req.body,
      errors,
      username: req.session.username
    });
  }
});

// GET /patients/:id/records/new - New medical record
app.get('/patients/:id/records/new', requireAuth, (req, res) => {
  const patient = db.getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).render('not-found', { message: 'Hasta bulunamadı' });
  }
  
  res.render('patients/record-edit', {
    action: `/patients/${patient.id}/records`,
    method: 'POST',
    title: 'Yeni Muayene Kaydı Oluştur',
    patient,
    record: { visit_date: new Date().toISOString().split('T')[0] },
    errors: [],
    username: req.session.username
  });
});

// POST /patients/:id/records - Create medical record
app.post('/patients/:id/records', requireAuth, (req, res) => {
  const patient = db.getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).render('not-found', { message: 'Hasta bulunamadı' });
  }
  
  const errors = [];
  
  if (!req.body.visit_date) {
    errors.push('Muayene tarihi gerekli');
  }
  
  if (errors.length > 0) {
    return res.render('patients/record-edit', {
      action: `/patients/${patient.id}/records`,
      method: 'POST',
      title: 'Yeni Muayene Kaydı Oluştur',
      patient,
      record: req.body,
      errors,
      username: req.session.username
    });
  }
  
  try {
    const record = db.createMedicalRecord({
      patient_id: patient.id,
      visit_date: req.body.visit_date,
      visit_type: req.body.visit_type || null,
      visit_week: req.body.visit_week || null,
      last_menstrual_date: req.body.last_menstrual_date || null,
      menstrual_day: req.body.menstrual_day || null,
      complaint: req.body.complaint || null,
      usg: req.body.usg || null,
      diagnosis: req.body.diagnosis || null,
      outcome: req.body.outcome || null,
      additional_chronic_conditions: req.body.additional_chronic_conditions || null,
      additional_medications: req.body.additional_medications || null,
      additional_allergies: req.body.additional_allergies || null,
      additional_surgeries: req.body.additional_surgeries || null
    });
    
    res.redirect(`/patients/${patient.id}`);
  } catch (err) {
    console.error('Create record error:', err);
    errors.push('Muayene kaydı oluşturma sırasında hata oluştu');
    res.render('patients/record-edit', {
      action: `/patients/${patient.id}/records`,
      method: 'POST',
      title: 'Yeni Muayene Kaydı Oluştur',
      patient,
      record: req.body,
      errors,
      username: req.session.username
    });
  }
});

// GET /patients/:id/records/:record_id - Edit medical record
app.get('/patients/:id/records/:record_id/edit', requireAuth, (req, res) => {
  const patient = db.getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).render('not-found', { message: 'Hasta bulunamadı' });
  }
  
  const record = db.getMedicalRecordById(req.params.record_id);
  if (!record || record.patient_id !== patient.id) {
    return res.status(404).render('not-found', { message: 'Muayene kaydı bulunamadı' });
  }
  
  res.render('patients/record-edit', {
    action: `/patients/${patient.id}/records/${record.id}/update`,
    method: 'POST',
    title: 'Muayene Kaydını Düzenle',
    patient,
    record,
    errors: [],
    username: req.session.username
  });
});

// POST /patients/:id/records/:record_id/update - Update medical record
app.post('/patients/:id/records/:record_id/update', requireAuth, (req, res) => {
  const patient = db.getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).render('not-found', { message: 'Hasta bulunamadı' });
  }
  
  const record = db.getMedicalRecordById(req.params.record_id);
  if (!record || record.patient_id !== patient.id) {
    return res.status(404).render('not-found', { message: 'Muayene kaydı bulunamadı' });
  }
  
  try {
    // Handle merging of additional conditions/medications/allergies/surgeries with patient's existing data
    const updatedPatient = { ...patient };
    
    if (req.body.additional_chronic_conditions && req.body.additional_chronic_conditions.trim()) {
      const newConditions = req.body.additional_chronic_conditions.split('\n').map(c => c.trim()).filter(c => c);
      updatedPatient.chronic_conditions = [...(updatedPatient.chronic_conditions || []), ...newConditions];
    }
    
    if (req.body.additional_medications && req.body.additional_medications.trim()) {
      const newMeds = req.body.additional_medications.split('\n').map(m => m.trim()).filter(m => m);
      updatedPatient.medications = [...(updatedPatient.medications || []), ...newMeds];
    }
    
    if (req.body.additional_allergies && req.body.additional_allergies.trim()) {
      const newAllergies = req.body.additional_allergies.split('\n').map(a => a.trim()).filter(a => a);
      updatedPatient.allergies = [...(updatedPatient.allergies || []), ...newAllergies];
    }
    
    if (req.body.additional_surgeries && req.body.additional_surgeries.trim()) {
      const newSurgeries = req.body.additional_surgeries.split('\n').map(s => s.trim()).filter(s => s);
      updatedPatient.past_surgeries = [...(updatedPatient.past_surgeries || []), ...newSurgeries];
    }
    
    // Update patient with merged data
    db.updatePatient(patient.id, updatedPatient);
    
    db.updateMedicalRecord(record.id, {
      visit_type: req.body.visit_type || null,
      visit_week: req.body.visit_week || null,
      last_menstrual_date: req.body.last_menstrual_date || null,
      menstrual_day: req.body.menstrual_day || null,
      complaint: req.body.complaint || null,
      usg: req.body.usg || null,
      diagnosis: req.body.diagnosis || null,
      outcome: req.body.outcome || null,
      additional_chronic_conditions: null,
      additional_medications: null,
      additional_allergies: null,
      additional_surgeries: null
    });
    
    res.redirect(`/patients/${patient.id}`);
  } catch (err) {
    console.error('Update record error:', err);
    const errors = ['Güncelleme sırasında hata oluştu'];
    res.render('patients/record-edit', {
      action: `/patients/${patient.id}/records/${record.id}/update`,
      method: 'POST',
      title: 'Muayene Kaydını Düzenle',
      patient,
      record: { ...record, ...req.body },
      errors,
      username: req.session.username
    });
  }
});

// POST /patients/:id/records/:record_id/delete - Delete medical record
app.post('/patients/:id/records/:record_id/delete', requireAuth, (req, res) => {
  const patient = db.getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).render('not-found', { message: 'Hasta bulunamadı' });
  }
  
  try {
    db.deleteMedicalRecord(req.params.record_id);
    res.redirect(`/patients/${patient.id}`);
  } catch (err) {
    console.error('Delete record error:', err);
    res.status(500).render('not-found', { message: 'Muayene kaydı silinirken hata oluştu' });
  }
});

// POST /patients/:id/delete - Delete patient
app.post('/patients/:id/delete', requireAuth, (req, res) => {
  try {
    db.deletePatient(req.params.id);
    res.redirect('/patients');
  } catch (err) {
    console.error('Delete patient error:', err);
    res.status(500).render('not-found', { message: 'Hasta silinirken hata oluştu' });
  }
});

// GET /logout - Logout
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Logout hatası');
    }
    res.redirect('/login');
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('not-found', { message: 'Sayfa bulunamadı' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🏥 Hasta Kayıt Sistemi http://localhost:${PORT} üzerinde çalışıyor`);
  console.log('📝 Oturum açmak için /login adresine gidin');
});
