#!/bin/bash
# Deploys the partner-facing portal on the VPS.
#
# Same shape as the internal portal's deploy.sh — different port, and one extra thing to
# know: this is ONE build serving supplier, buyer and logistics_cha. The kind is read
# off the session at runtime (src/config/portals.js), so there is no per-kind build and
# nothing here to parameterise.
#
# Differs from KIORA's dietportal/deploy.sh in two ways, both deliberate:
#
#   1. No `npm install && npm run build` on the host. The Dockerfile is multi-stage and
#      builds inside the image, so this box needs no Node at all.
#
#   2. compose instead of docker stop/rm/run, so the port binding lives in
#      docker-compose.yml rather than in a flag that has to be remembered here.

set -euo pipefail

cd "$(dirname "$(readlink -f "$0")")"

echo "🚀 Deploying partner portal..."

git pull origin main

echo "🐳 Building and starting the container..."
docker compose up -d --build

echo "⏳ Waiting for nginx in the container..."
for _ in $(seq 1 15); do
  # -fs, not -fsS: -S re-enables the error text -s suppresses, so every failed poll of
  # a still-booting container printed a curl error.
  if curl -fs -o /dev/null http://127.0.0.1:5181/; then
    echo "✅ Partner portal deployed."
    echo
    # Cheap and worth it: this is the property the whole hostname split exists for, and
    # a reordered location block in partner.mavioglobal.com.conf breaks it silently.
    # Full coverage is backend/deploy/smoke.sh; this is the one check that must never
    # regress, run on every deploy of this app.
    # `|| code=...` rather than `|| echo` inside the substitution: on a connection
    # failure curl writes "000" via -w AND exits non-zero, so an inner echo would append
    # a second "000" and produce "000000". Being in an || list is also what stops
    # `set -e` killing the script when the host is simply not up yet.
    code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 \
      https://partner.mavioglobal.com/api/partners 2>/dev/null) || code="000"
    if [ "$code" = "404" ]; then
      echo "🔒 staff API not routed from the partner hostname (404) — correct."
    else
      echo "⚠️  WARNING: https://partner.mavioglobal.com/api/partners returned $code,"
      echo "    expected 404. The staff API may be reachable from the partner hostname."
      echo "    Check the location block order in backend/deploy/nginx/."
    fi
    exit 0
  fi
  sleep 2
done

echo "❌ Container did not serve within 30s. Recent logs:"
docker compose logs --tail=40
exit 1
