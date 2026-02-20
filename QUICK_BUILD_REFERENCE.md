# ⚡ Quick Build Reference

Quick commands for building and distributing the desktop application.

---

## 🏗️ Building

### Build for macOS (on Mac)
```bash
npm run build-mac
```

**Output:**
- `dist/Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi-1.0.0-arm64.dmg`
- `dist/Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi-1.0.0-arm64-mac.zip`

### Build for Windows
```bash
npm run build-win
```

**Output:**
- `dist/Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi Setup 1.0.0.exe` (installer)
- `dist/Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi 1.0.0.exe` (portable)

---

## 🧪 Testing

### Development Mode
```bash
npm run electron-dev
```
Opens Electron with hot-reload and dev tools.

### Test Built App (Mac)
```bash
open "dist/mac-arm64/Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi.app"
```

### Test Built App (Windows)
```bash
dist\Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi 1.0.0.exe
```

---

## 🧹 Clean Build

```bash
rm -rf dist node_modules
npm install
npm run build-mac  # or build-win
```

---

## 📦 What to Distribute

### For Mac Users:
**Send:** `Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi-1.0.0-arm64.dmg`
- User-friendly installer
- Just drag and drop to Applications

### For Windows Users:
**Send:** `Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi Setup 1.0.0.exe`
- Standard Windows installer
- Creates Start menu shortcuts

**Alternative:** `Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi 1.0.0.exe`
- No installation needed
- Runs from any folder

---

## 📁 File Locations

### After Build:
```
dist/
├── mac-arm64/
│   └── Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi.app
├── Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi-1.0.0-arm64.dmg
├── Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi-1.0.0-arm64-mac.zip
├── Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi Setup 1.0.0.exe
└── Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi 1.0.0.exe
```

### User Data (After Installation):

**Windows:**
```
C:\Users\[Username]\AppData\Local\Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi\
├── clinic.db
└── .sessions/
```

**macOS:**
```
~/Library/Application Support/Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi/
├── clinic.db
└── .sessions/
```

---

## 🔄 Version Update

1. Edit `package.json`:
```json
{
  "version": "1.0.1"
}
```

2. Rebuild:
```bash
npm run build-mac
npm run build-win
```

3. Distribute new installers

---

## 🚀 Transfer to Another Computer

### Set Up Development Environment:
```bash
# Clone repository
git clone https://github.com/[your-repo]/patient_record_system.git
cd patient_record_system

# Install dependencies
npm install

# Test in development
npm run electron-dev

# Build for distribution
npm run build-mac  # or build-win
```

### Transfer Just the Installer:
1. Copy files from `dist/` folder
2. Send via USB, cloud, or network
3. Recipient installs and runs

**No development setup needed for end users!**

---

## 🛠️ Troubleshooting

### Build fails with electron-builder error:
```bash
# Clear cache
rm -rf ~/Library/Caches/electron-builder
rm -rf node_modules dist
npm install
```

### Windows build on Mac requires Wine:
```bash
brew install wine-stable
```

### Port 3000 error during build:
```bash
# Kill existing process
lsof -ti :3000 | xargs kill -9
# Or restart computer
```

---

## 📊 Build Comparison

|  | Mac (.dmg) | Windows Installer | Windows Portable |
|---|---|---|---|
| **File Size** | ~150 MB | ~150 MB | ~150 MB |
| **Build Time** | 2-5 min | 3-7 min | 3-7 min |
| **User Friendly** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Installation** | Drag & drop | Setup wizard | None needed |
| **Shortcuts** | Yes | Yes | Manual |
| **Best For** | Standard users | Standard users | USB/portable use |

---

## ✅ Pre-Distribution Checklist

Before sending to users:

- [ ] Test the built application
- [ ] Verify login works (admin/password)
- [ ] Check database creates correctly
- [ ] Test adding a patient
- [ ] Test creating a medical record
- [ ] Test search functionality
- [ ] Verify application quits properly
- [ ] Check file size is reasonable (~150 MB)
- [ ] Test on clean computer if possible

---

## 🎯 One-Command Build All

macOS:
```bash
npm run build-mac && ls -lh dist/*.dmg
```

Windows:
```bash
npm run build-win && dir dist\*.exe
```

---

**Documentation Version:** 1.0  
**Last Updated:** February 2026
