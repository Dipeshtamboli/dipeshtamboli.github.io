#!/usr/bin/env bash
# Encrypt the private page content for the site.
# Usage: ./encrypt-private.sh [content-file]   (default: private-content.html)
# Prompts for a password, writes AES-256-CBC + PBKDF2 ciphertext to _data/private.json.
# Only the ciphertext is committed; your password and plaintext stay local.
set -euo pipefail

SRC="${1:-private-content.html}"
if [ ! -f "$SRC" ]; then
  echo "No '$SRC'. Create it first:  cp private-content.example.html private-content.html"
  exit 1
fi

read -r -s -p "Password: " PW; echo
read -r -s -p "Confirm password: " PW2; echo
[ "$PW" = "$PW2" ] || { echo "Passwords do not match."; exit 1; }

B64=$(openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -md sha256 -salt \
        -in "$SRC" -pass pass:"$PW" | openssl base64 -A)

mkdir -p _data
printf '{ "b64": "%s" }\n' "$B64" > _data/private.json
echo "Wrote _data/private.json. Now: rebuild (optional) and commit + push."
