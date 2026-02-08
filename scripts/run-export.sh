#!/bin/zsh

set -euo pipefail

export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
fi

PROJECT_DIR="/Users/zaferyildirim/Desktop/huseyin_sert"
cd "$PROJECT_DIR" || exit 1

MODE="${1:-manual}"

BACKUP_SCHEDULE="$MODE" node scripts/export-csv.js "$MODE"
