#!/bin/bash
# scripts/generate-ssl.sh
#
# This script does 3 things for local HTTPS development:
# 1. Installs mkcert (a tool that creates locally-trusted SSL certificates)
# 2. Generates SSL certs for your local domains
# 3. Adds domain entries to /etc/hosts so your browser resolves them to localhost
#
# WHY: Browsers block mixed content (HTTP on HTTPS pages), cookies need Secure flag,
# and CORS behaves differently with HTTPS. Testing on HTTP hides real bugs.

set -euo pipefail  # Exit on error, undefined vars, pipe failures

DOMAIN="infra-pro.com"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CERTS_DIR="${PROJECT_DIR}/nginx/certs"

echo "🔐 Setting up local HTTPS for ${DOMAIN}"

mkdir -p "$CERTS_DIR"

# Step 1: Install mkcert if not present
if ! command -v mkcert &> /dev/null; then
    echo "📦 Installing mkcert..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install mkcert
    else
        sudo apt install -y libnss3-tools
        curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
        chmod +x mkcert-v*-linux-amd64
        sudo mv mkcert-v*-linux-amd64 /usr/local/bin/mkcert
    fi
    mkcert -install
fi

# Step 2: Generate certificates
echo "📜 Generating SSL certificates..."
mkcert -key-file "${CERTS_DIR}/${DOMAIN}.key" \
       -cert-file "${CERTS_DIR}/${DOMAIN}.crt" \
       "${DOMAIN}" "*.${DOMAIN}"

mkcert -key-file "${CERTS_DIR}/api.${DOMAIN}.key" \
       -cert-file "${CERTS_DIR}/api.${DOMAIN}.crt" \
       "api.${DOMAIN}"

# Step 3: Add domains to /etc/hosts (if not already there)
echo "🌐 Checking /etc/hosts..."
DOMAINS_TO_ADD=("${DOMAIN}" "api.${DOMAIN}" "app.${DOMAIN}")
for d in "${DOMAINS_TO_ADD[@]}"; do
    if ! grep -q "$d" /etc/hosts; then
        echo "  Adding $d to /etc/hosts (requires sudo)"
        echo "127.0.0.1 $d" | sudo tee -a /etc/hosts > /dev/null
    else
        echo "  ✓ $d already in /etc/hosts"
    fi
done

echo ""
echo "✅ SSL certificates generated successfully in ${CERTS_DIR}"
echo "✅ Local domains configured:"
echo "   https://${DOMAIN}      → Frontend"
echo "   https://app.${DOMAIN}  → Frontend"
echo "   https://api.${DOMAIN}  → Backend API"