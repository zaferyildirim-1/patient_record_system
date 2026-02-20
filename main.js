const { app, BrowserWindow, Menu, dialog } = require('electron');
const http = require('http');
const path = require('path');
const fs = require('fs');

// More reliable isDev check
const isDev = process.env.NODE_ENV === 'development' || 
              process.defaultApp || 
              /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || 
              /[\\/]electron[\\/]/.test(process.execPath);

console.log('Development mode:', isDev);

let mainWindow;
const DEFAULT_PORT = process.env.PORT || '3000';
const SERVER_CHECK_PATH = '/login';

// Prevent multiple instances to avoid double-starting the server
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}

// Initialize database and sessions paths
function initializeAppPaths() {
  // Set app data directory
  const appDataPath = app.getPath('userData');
  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, { recursive: true });
  }

  // Set database and sessions paths in environment for use by database.js and server.js
  process.env.DB_PATH = path.join(appDataPath, 'clinic.db');
  process.env.SESSIONS_DIR = path.join(appDataPath, '.sessions');
}

// Set up environment before server starts
function initializeEnvironment() {
  const envPath = path.join(__dirname, '.env');
  if (!isDev) {
    // In production, set environment variables from .env or use defaults
    if (!fs.existsSync(envPath)) {
      // Create minimal .env with defaults for production
      const defaultEnv = `APP_USER=admin\nAPP_PASSWORD=password\nSESSION_SECRET=prod-secret-change-me\nOPENAI_API_KEY=`;
      try {
        fs.writeFileSync(envPath, defaultEnv);
      } catch (e) {
        console.log('Could not write .env, using environment defaults');
      }
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
    
    const port = process.env.PORT || DEFAULT_PORT;
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

app.whenReady().then(boot);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    const port = process.env.PORT || DEFAULT_PORT;
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

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
