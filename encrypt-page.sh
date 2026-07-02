#!/usr/bin/env bash
# Encrypt an HTML content file into an AES-256-CBC (PBKDF2) blob for a gated page.
# Usage: ./encrypt-page.sh <content.html> <out.json>
#   e.g. ./encrypt-page.sh python-content.html _data/python.json
# Only the ciphertext (out.json) is committed; your password + plaintext stay local.
set -euo pipefail

SRC="${1:?usage: ./encrypt-page.sh <content.html> <out.json>}"
OUT="${2:?usage: ./encrypt-page.sh <content.html> <out.json>}"
[ -f "$SRC" ] || { echo "No '$SRC' — create it (e.g. cp *.example.html to it) first."; exit 1; }

read -r -s -p "Password: " PW; echo
read -r -s -p "Confirm password: " PW2; echo
[ "$PW" = "$PW2" ] || { echo "Passwords do not match."; exit 1; }

B64=$(openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -md sha256 -salt \
        -in "$SRC" -pass pass:"$PW" | openssl base64 -A)

mkdir -p "$(dirname "$OUT")"
printf '{ "b64": "%s" }\n' "$B64" > "$OUT"
echo "Wrote $OUT. Rebuild (optional) and commit + push."
