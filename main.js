const { app, BrowserWindow, Menu, dialog } = require('electron');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Simple isDev check
const isDev = !app.isPackaged;

console.log('Development mode:', isDev);
console.log('App path:', app.getAppPath());

let mainWindow;
const DEFAULT_PORT = process.env.PORT || '3000';
const SERVER_CHECK_PATH = '/login';

// Initialize database and sessions paths
function initializeAppPaths() {
  const appDataPath = app.getPath('userData');
  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, { recursive: true });
  }
  process.env.DB_PATH = path.join(appDataPath, 'clinic.db');
  process.env.SESSIONS_DIR = path.join(appDataPath, '.sessions');
  console.log('DB Path:', process.env.DB_PATH);
}

// Set up environment before server starts
function initializeEnvironment() {
  const envPath = path.join(__dirname, '.env');
  if (!isDev && !fs.existsSync(envPath)) {
    const defaultEnv = `APP_USER=admin\nAPP_PASSWORD=password\nSESSION_SECRET=prod-secret-change-me\nOPENAI_API_KEY=`;
    try {
      fs.writeFileSync(envPath, defaultEnv);
    } catch (e) {
      console.log('Could not write .env');
    }
  }
  require('dotenv').config({ path: envPath });
  process.env.PORT = process.env.PORT || DEFAULT_PORT;
}

async function waitForServer(port, retries = 25, delay = 300) {
  return new Promise((resolve, reject) => {
    const attempt = (tryCount) => {
      const req = http.get({ hostname: 'localhost', port, path: SERVER_CHECK_PATH, timeout: 1000 }, (res) => {
        res.destroy();
        resolve();
      });

      req.on('timeout', () => {
        req.destroy();
        if (tryCount >= retries) {
          reject(new Error(`Sunucu ${port} portunda zaman aşımına uğradı`));
        } else {
          setTimeout(() => attempt(tryCount + 1), delay);
        }
      });

      req.on('error', (err) => {
        if (tryCount >= retries) {
          reject(err);
        } else {
          setTimeout(() => attempt(tryCount + 1), delay);
        }
      });
    };

    attempt(1);
  });
}

async function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      devTools: isDev // Disable devtools in production
    },
    icon: path.join(__dirname, 'public', 'icon.png')
  });

  const startUrl = `http://localhost:${port}`;

  try {
    await mainWindow.loadURL(startUrl);
    console.log('Window loaded successfully');
  } catch (err) {
    console.error('Failed to load window:', err);
    throw err;
  }

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function startBackend(port) {
  if (isDev) {
    await waitForServer(port);
    return { port, server: null };
  }

  try {
    const { startServer } = require('./src/server');
    const result = await startServer(port);
    console.log(`Server started on port ${port}`);
    return result;
  } catch (err) {
    console.error('Server start error:', err);
    throw err;
  }
}

async function boot() {
  try {
    console.log('Initializing app paths...');
    initializeAppPaths();
    
    console.log('Initializing environment...');
    initializeEnvironment();
    ensureSeedDatabaseExists();
    
    const port = parseInt(process.env.PORT || DEFAULT_PORT, 10);
    process.env.PORT = String(port);
    console.log(`Starting backend on port ${port}...`);
    
    await startBackend(port);
    
    console.log('Creating window...');
    await createWindow(port);
    
    console.log('Application started successfully!');
  } catch (err) {
    const message = err?.code === 'EADDRINUSE'
      ? `Port ${process.env.PORT || DEFAULT_PORT} kullanımda. Lütfen uygulamanın başka bir örneğini veya 3000 portunu kullanan süreci kapatın.`
      : err?.message || 'Sunucu başlatılamadı.';

    console.error('Electron başlatma hatası:', err);
    console.error('Stack:', err?.stack);
    
    dialog.showErrorBox('Sunucu başlatılamadı', `${message}\n\nDetay: ${err?.stack || err}`);
    app.quit();
  }
}

app.whenReady().then(() => {
  // Single instance lock - prevent multiple app instances
  const gotTheLock = app.requestSingleInstanceLock();
  
  if (!gotTheLock) {
    console.log('⚠️ Another instance is already running. Exiting.');
    dialog.showMessageBoxSync({
      type: 'warning',
      title: 'Uygulama Zaten Çalışıyor',
      message: 'Hasta Kayıt Sistemi zaten açık. Lütfen mevcut pencereyi kullanın.',
      buttons: ['Tamam']
    });
    app.quit();
    return;
  }

  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // Create daily backup on startup (max once per day)
  scheduleDailyBackup();
  
  boot();
});

// Schedule daily backup (checks if today's backup exists)
function scheduleDailyBackup() {
  try {
    const userData = app.getPath('userData');
    const backupDir = path.join(userData, 'backups');
    const today = new Date().toISOString().split('T')[0];
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Check if today's backup already exists
    const files = fs.readdirSync(backupDir).filter(f => f.includes(today) && f.includes('daily'));
    
    if (files.length === 0) {
      createBackup('daily');
    } else {
      console.log('ℹ️ Today\'s backup already exists');
    }
  } catch (e) {
    console.error('❌ Daily backup check error:', e);
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    const port = parseInt(process.env.PORT || DEFAULT_PORT, 10);
    process.env.PORT = String(port);
    createWindow(port);
  }
});

// Create menu
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Exit',
        accelerator: 'CmdOrCtrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        click: () => {
          // Create about window
          const aboutWindow = new BrowserWindow({
            width: 400,
            height: 300,
            parent: mainWindow,
            modal: true
          });
          aboutWindow.loadURL(`data:text/html;charset=utf-8,
            <html>
              <body style="font-family: Arial; padding: 20px;">
                <h2>Op Dr. Hüseyin Sert</h2>
                <p>Hasta Kayıt Sistemi</p>
                <p>Version 1.0.0</p>
              </body>
            </html>
          `);
        }
      }
    ]
  }
];

// const menu = Menu.buildFromTemplate(template); // TEMP DISABLE MENU BUILD
// Menu.setApplicationMenu(menu); // TEMP DISABLE MENU

function ensureSeedDatabaseExists() {
  try {
    const userData = app.getPath('userData');
    const targetDb = path.join(userData, 'clinic.db');
    const seedDb = path.join(process.resourcesPath || '', 'seed', 'clinic.db');

    const seedExists = fs.existsSync(seedDb);
    const targetExists = fs.existsSync(targetDb);

    if (!seedExists) {
      console.log('ℹ️ Seed DB not found:', seedDb);
      console.log('   This is normal for development or when no seed DB is provided.');
      return;
    }

    // If target DB doesn't exist, safe to copy seed
    if (!targetExists) {
      fs.copyFileSync(seedDb, targetDb);
      console.log('✅ Seed DB copied to:', targetDb);
      return;
    }

    // Target DB exists - check if it has data
    const targetSize = fs.statSync(targetDb).size;
    
    // If size is suspiciously small, check for actual data
    if (targetSize < 45000) {
      // Check if DB is corrupt or truly empty
      const initSqlJs = require('sql.js');
      
      initSqlJs().then(SQL => {
        try {
          const data = fs.readFileSync(targetDb);
          const db = new SQL.Database(data);
          
          // Check if patients table has data
          const result = db.exec("SELECT COUNT(*) as count FROM patients");
          const patientCount = result[0]?.values[0]?.[0] || 0;
          
          db.close();

          if (patientCount === 0) {
            // Truly empty - backup and replace
            const bak = `${targetDb}.empty-backup.${Date.now()}.db`;
            fs.copyFileSync(targetDb, bak);
            fs.copyFileSync(seedDb, targetDb);
            console.log('✅ Empty DB detected. Backed up to:', bak);
            console.log('✅ Seed DB copied to:', targetDb);
          } else {
            console.log('✅ DB has', patientCount, 'patients. NOT overwriting.');
          }
        } catch (err) {
          // DB might be corrupt - backup and replace
          console.warn('⚠️ DB appears corrupt:', err.message);
          const bak = `${targetDb}.corrupt-backup.${Date.now()}.db`;
          fs.copyFileSync(targetDb, bak);
          fs.copyFileSync(seedDb, targetDb);
          console.log('✅ Corrupt DB backed up to:', bak);
          console.log('✅ Seed DB copied to:', targetDb);
        }
      }).catch(err => {
        console.error('❌ Could not check DB data:', err.message);
      });
    } else {
      console.log('✅ DB exists with data (', Math.round(targetSize/1024), 'KB). NOT overwriting.');
    }
  } catch (e) {
    console.error('❌ ensureSeedDatabaseExists error:', e);
  }
}

// Create automatic backup before any risky operation
function createBackup(reason = 'manual') {
  try {
    const userData = app.getPath('userData');
    const targetDb = path.join(userData, 'clinic.db');
    const backupDir = path.join(userData, 'backups');
    
    if (!fs.existsSync(targetDb)) {
      console.log('ℹ️ No DB to backup');
      return null;
    }

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '-' + 
                      new Date().toTimeString().split(' ')[0].replace(/:/g, '');
    const backupPath = path.join(backupDir, `clinic-${reason}-${timestamp}.db`);
    
    fs.copyFileSync(targetDb, backupPath);
    console.log('✅ Backup created:', backupPath);

    // Keep only last 20 backups to save space
    cleanOldBackups(backupDir, 20);
    
    return backupPath;
  } catch (e) {
    console.error('❌ Backup error:', e);
    return null;
  }
}

// Remove old backups keeping only the most recent
function cleanOldBackups(backupDir, keepCount = 20) {
  try {
    const files = fs.readdirSync(backupDir)
      .filter(f => f.endsWith('.db'))
      .map(f => ({
        name: f,
        path: path.join(backupDir, f),
        time: fs.statSync(path.join(backupDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // newest first

    // Delete old backups
    files.slice(keepCount).forEach(file => {
      fs.unlinkSync(file.path);
      console.log('🗑️ Removed old backup:', file.name);
    });
  } catch (e) {
    console.error('❌ cleanOldBackups error:', e);
  }
}
