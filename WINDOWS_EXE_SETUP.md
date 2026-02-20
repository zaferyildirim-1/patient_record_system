# Windows Executable Setup Guide

## ✅ What's Fixed

The Windows `.exe` now works correctly with:
- **Database location**: Automatically saved in `AppData\Local\Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi\clinic.db`
- **Sessions folder**: Automatically saved in the same application data folder
- **No dependency on .env**: The app creates default settings if .env is missing
- **Works out of the box**: Just click the `.exe` to run

## 📥 Installation

### Option 1: Portable Executable (Easiest)
```
Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi 1.0.0.exe
```
- Double-click to run directly (no installation needed)
- Runs from any folder
- All data stored in user's AppData folder

### Option 2: Installer
```
Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi Setup 1.0.0.exe
```
- Standard Windows installer
- Creates Start menu shortcuts
- Option to choose install location

## 🚀 First Run

1. **Download** the `.exe` file from GitHub releases or your Mac
2. **Run** the `.exe`
3. **Login** with:
   - Username: `admin`
   - Password: `password`
4. **Add patients** and manage records

## 📊 Data Location

All data is stored in:
```
C:\Users\[YourUsername]\AppData\Local\Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi\
```

This folder contains:
- `clinic.db` - Patient database
- `.sessions/` - Session information

## 🔑 API Keys (Optional)

To enable DOCX file import with AI extraction:

1. Open `.env` file in the app data folder
2. Add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```
3. Restart the app
4. Import works without this, but uses default behavior

## 🐛 Troubleshooting

### App won't start
- Make sure Windows Defender/antivirus isn't blocking it
- Try running as Administrator: Right-click → Run as administrator

### Database/sessions not saving
- Check AppData folder exists:
  `C:\Users\[YourUsername]\AppData\Local\Op Dr. Hüseyin Sert - Hasta Kayıt Sistemi\`
- Make sure you have write permissions

### App is slow
- First run creates database (slower)
- After first run, should be instant
- Check that antivirus isn't scanning the AppData folder

## 🔄 Update

To update to a new version:
1. Download the newest `.exe`
2. Run it (replaces only the app, keeps your data)

Your database will be preserved automatically!

## 💡 Tips

- Create desktop shortcut: Right-click → Send to → Desktop (create shortcut)
- App works completely offline (no internet needed)
- Share `.exe` file with other computers - no installation needed

---

**Version**: 1.0.0  
**Built with**: Electron 40.6.0  
**Database**: SQLite3 (embedded)
