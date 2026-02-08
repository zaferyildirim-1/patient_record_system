// Main Electron process - Enhanced version with proper exit handling
import { app, BrowserWindow, Menu, dialog } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Tıbbi Kayıt Yönetim Sistemi',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    show: false // Don't show until ready
  });

  // Load the HTML file
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle close event (when user clicks X button)
  mainWindow.on('close', (event) => {
    if (!mainWindow) return;
    
    // Show confirmation dialog
    const response = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      buttons: ['Evet, Çık', 'İptal'],
      defaultId: 1,
      message: 'Uygulamadan çıkmak istediğinizden emin misiniz?',
      detail: 'Kaydedilmemiş değişiklikler kaybolabilir.'
    });

    if (response === 1) {
      event.preventDefault(); // Cancel the close
    }
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template: any[] = [
    {
      label: 'Dosya',
      submenu: [
        {
          label: 'Yeni Hasta',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript("showPage('new-patient')");
            }
          }
        },
        {
          label: 'Hasta Listesi',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript("showPage('patients')");
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Yedekle',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript("backupDatabase()");
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Çıkış',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            if (mainWindow) {
              mainWindow.close();
            }
          }
        }
      ]
    },
    {
      label: 'Düzen',
      submenu: [
        { role: 'undo', label: 'Geri Al' },
        { role: 'redo', label: 'Yinele' },
        { type: 'separator' },
        { role: 'cut', label: 'Kes' },
        { role: 'copy', label: 'Kopyala' },
        { role: 'paste', label: 'Yapıştır' }
      ]
    },
    {
      label: 'Görünüm',
      submenu: [
        { role: 'reload', label: 'Yenile' },
        { role: 'forceReload', label: 'Zorla Yenile' },
        { role: 'toggleDevTools', label: 'Geliştirici Araçları' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Yakınlaştırmayı Sıfırla' },
        { role: 'zoomIn', label: 'Yakınlaştır' },
        { role: 'zoomOut', label: 'Uzaklaştır' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tam Ekran' }
      ]
    },
    {
      label: 'Yardım',
      submenu: [
        {
          label: 'Hakkında',
          click: () => {
            if (mainWindow) {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Hakkında',
                message: 'Tıbbi Kayıt Yönetim Sistemi',
                detail: 'Sürüm 1.0.0\n\nJinekoloji kliniği için hasta kayıt yönetim sistemi.\n\n© 2026 Medical Clinic'
              });
            }
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: 'Hakkında ' + app.getName() },
        { type: 'separator' },
        { role: 'services', label: 'Servisler' },
        { type: 'separator' },
        { role: 'hide', label: app.getName() + '\'yi Gizle' },
        { role: 'hideothers', label: 'Diğerlerini Gizle' },
        { role: 'unhide', label: 'Tümünü Göster' },
        { type: 'separator' },
        { role: 'quit', label: app.getName() + '\'den Çık' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle app quit
app.on('before-quit', (event) => {
  // This runs before the app quits - you can add cleanup logic here
  console.log('Uygulama kapatılıyor...');
});
