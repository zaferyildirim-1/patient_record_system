#!/usr/bin/osascript

# Hasta Kayıt Sistemi - macOS App Launcher
# Bu script Automator olmadan çalışır

tell application "Terminal"
    activate
    set currentTab to do script "cd " & quoted form of "/Users/zaferyildirim/Desktop/huseyin_sert" & " && ./start-server.command"
end tell
