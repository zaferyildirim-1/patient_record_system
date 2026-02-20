const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');
let mainWindow;

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
  if (!isDev) {
    // In production, set environment variables from .env or use defaults
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
      // Create minimal .env with defaults for production
      const defaultEnv = `OPENAI_API_KEY=sk-placeholder\nADMIN_USERNAME=admin\nADMIN_PASSWORD=password\nSESSION_SECRET=prod-secret-change-me`;
      try {
        fs.writeFileSync(envPath, defaultEnv);
      } catch (e) {
        console.log('Could not write .env, using environment defaults');
      }
    }
  }

  require('dotenv').config({ path: path.join(__dirname, '.env') });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'public', 'icon.png')
  });

  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, 'build', 'index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', () => {
  // Initialize paths and environment
  initializeAppPaths();
  initializeEnvironment();
  
  // Start Express server
  require('./src/server');
  setTimeout(createWindow, 1000);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
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
