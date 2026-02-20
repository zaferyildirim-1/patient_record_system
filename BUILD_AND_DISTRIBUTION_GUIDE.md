# 🚀 Build & Distribution Guide

**Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi**

This guide explains how to build desktop applications for Mac and Windows that users can install with a simple double-click.

---

## 📦 What You Get

After building, you'll have **installer files** that you can simply send to users:

### For macOS:
- **`.dmg` file** - Drag-and-drop installer (like any Mac app)
- **`.zip` file** - Compressed app bundle

### For Windows:
- **`.exe` installer** - Standard Windows installer with setup wizard
- **`.exe` portable** - Standalone executable (no installation needed)

---

## 🏗️ Building the Application

### Prerequisites

Make sure you have:
- **Node.js v18+** installed ([download here](https://nodejs.org/))
- **npm** (comes with Node.js)
- All dependencies installed: `npm install`

### 1️⃣ Build for macOS

**On Mac computer:**

```bash
# Make sure you're in the project directory
cd /Users/zaferyildirim/Desktop/huseyin_sert

# Build for Mac
npm run build-mac
```

**Output location:**
```
dist/mac-arm64/Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi.app
dist/Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi-1.0.0-arm64.dmg
dist/Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi-1.0.0-arm64-mac.zip
```

⏱️ **Build time:** 2-5 minutes

### 2️⃣ Build for Windows

**On Mac (cross-platform build):**

```bash
npm run build-win
```

**On Windows:**

```bash
npm run build-win
```

**Output location:**
```
dist/Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi Setup 1.0.0.exe    (installer)
dist/Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi 1.0.0.exe         (portable)
```

⏱️ **Build time:** 3-7 minutes

> **Note:** Cross-platform builds from Mac to Windows work, but may require Wine. Building on the target platform is recommended for best results.

---

## 📤 Distributing to Users

### Option 1: Direct File Transfer (Recommended)
1. Build the application
2. Copy installer files from `dist/` folder
3. Send via USB drive, cloud storage, or email
4. User downloads and installs

### Option 2: GitHub Releases (For updates)
1. Create a release on GitHub
2. Upload the installer files
3. Users download from releases page

### What to Send:

**For Mac users:**
- Send the `.dmg` file (most user-friendly)
- Alternative: `.zip` file (smaller size)

**For Windows users:**
- Send **Installer** (`.exe` setup) if they want Start menu integration
- Send **Portable** (`.exe` standalone) if they prefer no installation

---

## 💻 Installation Instructions for End Users

### macOS Installation

1. **Download** the `.dmg` file
2. **Double-click** to open it
3. **Drag** the app icon to Applications folder
4. **Launch** from Applications or Spotlight search
5. If macOS blocks it: Go to **System Preferences > Security & Privacy** → Click "Open Anyway"

### Windows Installation

#### Option A: Using Installer (Recommended)
1. **Download** `Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi Setup 1.0.0.exe`
2. **Double-click** to run installer
3. Follow setup wizard (choose install location)
4. **Launch** from Start Menu or Desktop shortcut

#### Option B: Portable (No Installation)
1. **Download** `Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi 1.0.0.exe`
2. **Move** to desired folder (e.g., Desktop)
3. **Double-click** to run (runs directly, no installation)
4. Create shortcut if needed: Right-click → Send to → Desktop

---

## 🗄️ Data Storage

The application is **completely self-contained**:

### macOS:
```
~/Library/Application Support/Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi/
├── clinic.db          (Patient database)
└── .sessions/         (User sessions)
```

### Windows:
```
C:\Users\[Username]\AppData\Local\Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi\
├── clinic.db          (Patient database)
└── .sessions/         (User sessions)
```

✅ **Automatic creation** - Folders and database created on first launch  
✅ **No manual setup** - Works out of the box  
✅ **Persistent data** - Data survives app updates  
✅ **No internet required** - Completely offline

---

## 🔐 Default Login Credentials

First-time users can login with:
- **Username:** `admin`
- **Password:** `password`

⚠️ **Important:** Change these credentials after first login for security!

---

## 🔄 Updating the Application

### For Developers:
1. Make your code changes
2. Update version in `package.json`:
   ```json
   "version": "1.0.1"
   ```
3. Rebuild: `npm run build-mac` or `npm run build-win`
4. Distribute new installer

### For End Users:
1. Download new installer
2. Install (overwrites old version)
3. **Data is preserved** automatically (database not touched)

---

## 🛠️ Troubleshooting

### Build Issues

**Problem:** `electron-builder` fails
**Solution:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build-mac  # or build-win
```

**Problem:** Windows build fails on Mac
**Solution:**
- Install Wine: `brew install wine-stable`
- Or build on a Windows machine directly

### Runtime Issues

**macOS: "App is damaged"**
- Right-click the app → Open
- Or: System Preferences → Security & Privacy → Open Anyway

**Windows: Antivirus blocks the app**
- Add exception for the app in Windows Defender
- This is normal for unsigned applications

**Port 3000 already in use**
- Close other instances of the app
- Or: Kill process using port 3000

---

## 🎯 Quick Commands Cheat Sheet

```bash
# Install dependencies
npm install

# Development mode (hot reload)
npm run electron-dev

# Build for current platform
npm run build-mac      # On Mac
npm run build-win      # For Windows

# Clean build
rm -rf dist node_modules
npm install
npm run build-mac
```

---

## 📁 Project Structure

```
huseyin_sert/
├── main.js              # Electron main process (app entry point)
├── preload.js           # Electron preload script (security)
├── package.json         # Dependencies and build config
├── src/
│   ├── server.js        # Express backend server
│   ├── database.js      # SQLite database operations
│   └── ...
├── views/               # EJS templates (HTML pages)
├── public/              # Static assets (CSS, images)
└── dist/                # Built installers (after build)
```

---

## 🚀 Quick Start for New Computer

### Developer Setup:
```bash
git clone https://github.com/[your-repo]/patient_record_system.git
cd patient_record_system
npm install
npm run electron-dev
```

### End User Setup:
1. Download installer (.dmg or .exe)
2. Double-click to install
3. Launch and login
4. Start using immediately

---

## 💡 Best Practices

✅ **Version control** - Always update version number before building  
✅ **Test before distributing** - Run the built app to verify it works  
✅ **Keep source code** - Always have a backup of your source code  
✅ **Document changes** - Update README for each version  
✅ **Backup database** - Users should backup their `clinic.db` file regularly  

---

## 📞 Support

For technical issues or questions:
- Check terminal console for error messages
- Review logs in Application Support folder
- Contact developer with detailed error description

---

**Version:** 1.0.0  
**Updated:** February 2026  
**Built with:** Electron 40.6.0 + Node.js + SQLite
