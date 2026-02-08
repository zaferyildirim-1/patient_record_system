const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');
require('dotenv').config(); // Load .env file
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Require SESSION_SECRET from environment
if (!process.env.SESSION_SECRET) {
  console.error('FATAL: SESSION_SECRET environment variable is required!');
  console.error('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  process.exit(1);
}
const SESSION_SECRET = process.env.SESSION_SECRET;

// Security: Admin credentials set in database.js (no fallback here)
const AUTH_USER = process.env.APP_USER;
const AUTH_PASSWORD = process.env.APP_PASSWORD;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(
  session({
    store: new FileStore({
      path: path.join(__dirname, '..', '.sessions'),
      ttl: 12 * 60 * 60, // 12 hours
      retries: 0
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 12 * 60 * 60 * 1000
    }
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use((req, res, next) => {
  res.locals.currentUser = req.session?.user || null;
  next();
});

const patientRequiredFields = ['full_name', 'age'];
const patientFieldLabels = {
  full_name: 'Ad Soyad',
  age: 'Yaş',
  birth_date: 'Doğum Tarihi',
  phone_number: 'Cep Numarası'
};

const recordRequiredFields = ['visit_date'];
const recordFieldLabels = {
  visit_date: 'Ziyaret Tarihi'
};

function requireAuth(req, res, next) {
  if (req.session?.user) {
    return next();
  }
  res.redirect('/login');
}

function mapPatient(body) {
  const age = body.age !== undefined && body.age !== '' ? Number(body.age) : null;
  return {
    full_name: (body.full_name || '').trim(),
    age: age,
    birth_date: (body.birth_date || '').trim() || null,
    phone_number: (body.phone_number || '').trim() || null
  };
}

function mapRecord(body) {
  return {
    visit_date: body.visit_date,
    visit_type: (body.visit_type || '').trim() || null,
    last_menstrual_date: (body.last_menstrual_date || '').trim() || null,
    menstrual_day: (body.menstrual_day || '').trim() || null,
    complaint: (body.complaint || '').trim(),
    usg: (body.usg || '').trim(),
    diagnosis: (body.diagnosis || '').trim(),
    outcome: (body.outcome || '').trim()
  };
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

app.get('/login', (req, res) => {
  if (req.session?.user) {
    res.redirect('/');
    return;
  }
  res.render('login', { error: null, username: '' });
});

app.post('/login', async (req, res) => {
  const username = (req.body.username || '').trim();
  const password = req.body.password || '';

  try {
    const user = await db.findUserByUsername(username);
    
    if (user && await db.verifyPassword(password, user.password_hash)) {
      req.session.user = { username: user.username };
      res.redirect('/');
      return;
    }

    res.status(401).render('login', {
      error: 'Kullanici adi veya sifre hatali.',
      username
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).render('login', {
      error: 'Giris sirasinda bir hata olustu.',
      username
    });
  }
});

app.post('/logout', (req, res) => {
  const done = () => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  };

  if (!req.session) {
    done();
    return;
  }

  req.session.destroy(() => {
    done();
  });
});

app.use(requireAuth);

app.get('/', (req, res) => {
  const stats = db.getStats();
  const todayPatients = db.listTodayPatients();
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const dayName = new Intl.DateTimeFormat('tr-TR', { weekday: 'long' }).format(now);
  const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  const currentMoment = `${day}.${month}.${year} ${capitalizedDay}`;
  res.render('home', { stats, todayPatients, currentMoment, formatDate });
});

app.get('/patients', (req, res) => {
  const filters = {
    patient_code: (req.query.patient_code || '').trim(),
    full_name: (req.query.full_name || '').trim()
  };
  const hasFilters = Object.values(filters).some((value) => value);
  const patients = db.listPatients(filters);
  res.render('patients/index', { patients, filters, hasFilters, formatDate });
});

app.get('/patients/new', (req, res) => {
  res.render('patients/form', {
    patient: null,
    errors: [],
    action: '/patients',
    method: 'POST',
    title: 'Yeni Hasta Kaydi',
    formatDate
  });
});

app.post('/patients', (req, res) => {
  const data = mapPatient(req.body);
  const errors = [];
  
  if (!data.full_name) errors.push('Ad Soyad');
  if (data.age === null || data.age === undefined) errors.push('Yaş');

  if (errors.length) {
    res.status(400).render('patients/form', {
      patient: data,
      errors,
      action: '/patients',
      method: 'POST',
      title: 'Yeni Hasta Kaydi',
      formatDate
    });
    return;
  }

  db.createPatient(data);
  res.redirect('/patients');
});

app.get('/patients/:id', (req, res) => {
  const patient = db.getPatient(req.params.id);
  if (!patient) {
    res.status(404).render('not-found');
    return;
  }
  const rawRecords = db.listRecords(patient.id);
  const parseVisitTime = (value) => {
    if (!value) {
      return null;
    }
    const trimmed = String(value).trim();
    if (!trimmed) {
      return null;
    }
    const timestamp = Date.parse(trimmed);
    return Number.isNaN(timestamp) ? null : timestamp;
  };

  const sortedRecords = [...rawRecords].sort((a, b) => {
    const timeA = parseVisitTime(a.visit_date);
    const timeB = parseVisitTime(b.visit_date);

    if (timeA !== null && timeB !== null && timeA !== timeB) {
      return timeB - timeA;
    }

    if (timeA !== null && timeB === null) {
      return -1;
    }

    if (timeA === null && timeB !== null) {
      return 1;
    }

    const orderA = Number(a.visit_order) || 0;
    const orderB = Number(b.visit_order) || 0;
    if (orderA !== orderB) {
      return orderB - orderA;
    }

    return Number(b.id) - Number(a.id);
  });
  const totalVisits = sortedRecords.length;
  const records = sortedRecords.map((record, index) => {
    const displayVisitOrder = totalVisits - index;
    return {
      ...record,
      displayVisitOrder
    };
  });
  res.render('patients/detail', { patient, records, recordErrors: [], recordDraft: {}, formatDate });
});

app.get('/patients/:id/edit', (req, res) => {
  const patient = db.getPatient(req.params.id);
  if (!patient) {
    res.status(404).render('not-found');
    return;
  }
  res.render('patients/form', {
    patient,
    errors: [],
    action: `/patients/${patient.id}/update`,
    method: 'POST',
    title: 'Hasta Bilgilerini Guncelle',
    formatDate
  });
});

app.post('/patients/:id/update', (req, res) => {
  const patient = db.getPatient(req.params.id);
  if (!patient) {
    res.status(404).render('not-found');
    return;
  }

  const data = mapPatient(req.body);
  const errors = [];
  
  if (!data.full_name) errors.push('Ad Soyad');
  if (data.age === null || data.age === undefined) errors.push('Yaş');

  if (errors.length) {
    res.status(400).render('patients/form', {
      patient: { id: patient.id, ...data },
      errors,
      action: `/patients/${patient.id}/update`,
      method: 'POST',
      title: 'Hasta Bilgilerini Guncelle',
      formatDate
    });
    return;
  }

  db.updatePatient(patient.id, data);
  res.redirect(`/patients/${patient.id}`);
});

app.post('/patients/:id/delete', (req, res) => {
  db.deletePatient(req.params.id);
  res.redirect('/patients');
});

app.post('/patients/:id/records', (req, res) => {
  const patient = db.getPatient(req.params.id);
  if (!patient) {
    res.status(404).render('not-found');
    return;
  }

  const record = mapRecord(req.body);
  const errors = recordRequiredFields.filter((field) => !record[field]).map((field) => recordFieldLabels[field] || field);

  if (errors.length) {
    const records = db
      .listRecords(patient.id)
      .map((record, index) => ({
        ...record,
        displayVisitOrder: Number(record.visit_order) || index + 1
      }));
    res.status(400).render('patients/detail', {
      patient,
      records,
      recordErrors: errors,
      recordDraft: record,
      formatDate
    });
    return;
  }

  db.createRecord(patient.id, record);
  res.redirect(`/patients/${patient.id}`);
});

app.post('/patients/:id/records/:recordId/delete', (req, res) => {
  const patient = db.getPatient(req.params.id);
  if (!patient) {
    res.status(404).render('not-found');
    return;
  }
  db.deleteRecord(req.params.recordId);
  res.redirect(`/patients/${patient.id}`);
});

app.get('/patients/:id/records/:recordId/edit', (req, res) => {
  const patient = db.getPatient(req.params.id);
  if (!patient) {
    res.status(404).render('not-found');
    return;
  }
  const record = db.getRecord(req.params.recordId);
  if (!record || record.patient_id !== patient.id) {
    res.status(404).render('not-found');
    return;
  }
  res.render('patients/record-edit', {
    patient,
    record,
    errors: [],
    formatDate
  });
});

app.post('/patients/:id/records/:recordId/update', (req, res) => {
  const patient = db.getPatient(req.params.id);
  if (!patient) {
    res.status(404).render('not-found');
    return;
  }
  const record = db.getRecord(req.params.recordId);
  if (!record || record.patient_id !== patient.id) {
    res.status(404).render('not-found');
    return;
  }

  const data = {
    visit_date: (req.body.visit_date || '').trim(),
    visit_type: (req.body.visit_type || '').trim(),
    last_menstrual_date: (req.body.last_menstrual_date || '').trim() || null,
    menstrual_day: (req.body.menstrual_day || '').trim() || null,
    complaint: (req.body.complaint || '').trim(),
    usg: (req.body.usg || '').trim(),
    diagnosis: (req.body.diagnosis || '').trim(),
    outcome: (req.body.outcome || '').trim()
  };

  if (!data.visit_date) {
    res.status(400).render('patients/record-edit', {
      patient,
      record: { ...record, ...data },
      errors: ['Muayene Tarihi zorunludur'],
      formatDate
    });
    return;
  }

  db.updateRecord(req.params.recordId, data);
  res.redirect(`/patients/${patient.id}`);
});

app.get('/change-password', requireAuth, (req, res) => {
  res.render('change-password', { error: null, success: null });
});

app.post('/change-password', requireAuth, async (req, res) => {
  const currentPassword = req.body.current_password || '';
  const newPassword = req.body.new_password || '';
  const confirmPassword = req.body.confirm_password || '';

  try {
    const username = req.session.user.username;
    const user = await db.findUserByUsername(username);

    if (!user) {
      res.status(400).render('change-password', {
        error: 'Kullanici bulunamadi.',
        success: null
      });
      return;
    }

    const isValid = await db.verifyPassword(currentPassword, user.password_hash);
    if (!isValid) {
      res.status(400).render('change-password', {
        error: 'Mevcut sifre yanlis.',
        success: null
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).render('change-password', {
        error: 'Yeni sifre en az 6 karakter olmalidir.',
        success: null
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).render('change-password', {
        error: 'Yeni sifreler eslesmedi.',
        success: null
      });
      return;
    }

    await db.changePassword(username, newPassword);
    
    res.render('change-password', {
      error: null,
      success: 'Sifreniz basariyla degistirildi.'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).render('change-password', {
      error: 'Sifre degistirme sirasinda bir hata olustu.',
      success: null
    });
  }
});

app.use((req, res) => {
  res.status(404).render('not-found');
});

db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Hasta kayit uygulamasi http://localhost:${PORT} adresinde hazir.`);
    });
  })
  .catch((error) => {
    console.error('Veritabani baslatilirken bir hata olustu.', error);
    process.exit(1);
  });
