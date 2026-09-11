# Deploying the partner portal

Self-contained: nothing here needs a `backend/` checkout on the box. The portal is a
static bundle in an nginx container on `127.0.0.1:5181`, fronted by the host nginx which
owns TLS for `partner.mavioglobal.com`.

**One build serves all three kinds.** supplier, buyer and logistics_cha get the same
bundle; `src/config/portals.js` reads the kind off the session at runtime. There is no
per-kind build and no per-kind hostname.

**It deploys independently of the backend.** Until the API container exists,
`/api/portal/*` returns 502 and nobody can log in. Expected intermediate state.

## Ports on the VPS

| Port | Owner |
|---|---|
| 80, 443 | host nginx (`apt`-installed, not Docker) |
| 8000, 8001, 6379, 8080 | other stacks — **taken** |
| `127.0.0.1:5181` | `mavio-partner-portal`, this app |
| `127.0.0.1:8002` | the API, when deployed |

## First deploy

```bash
git clone https://github.com/VarunAgarwal11/partner.git /opt/mavio-global/partner-portal
cd /opt/mavio-global/partner-portal
docker compose up -d --build
curl -sI localhost:5181 | head -3          # expect 200, text/html
```

No Node needed on the box — the Dockerfile is multi-stage.

```bash
sudo install -m 644 deploy/nginx/partner.mavioglobal.com.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/partner.mavioglobal.com.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

curl -s http://partner.mavioglobal.com/ | grep -o '<title>[^<]*</title>'   # plain http, not a browser
sudo certbot --nginx -d partner.mavioglobal.com                            # choose redirect
```

Copy certbot's rewritten file back into `deploy/nginx/` and commit, or the repo and the
box drift on the first renewal.

## Redeploying

```bash
/opt/mavio-global/partner-portal/deploy.sh
```

Pulls, rebuilds, polls `127.0.0.1:5181`, then re-runs the API isolation check below.

## Verify — the check that matters

```bash
curl -so /dev/null -w '%{http_code}\n' https://partner.mavioglobal.com/api/partners
#   -> 404   MUST be 404
curl -so /dev/null -w '%{http_code}\n' https://partner.mavioglobal.com/api/portal/auth/me
#   -> 401   proxied through and rejected by the app = correct
```

The staff API must not be **routed** from this hostname, not merely rejected by it. A
`401` on `/api/partners` means nginx proxied a staff endpoint here and only the session
check stopped it — the layer is gone, and any future route that forgets its permission
gate is exposed to a partner's browser.

There is no unit test for nginx location ordering. That curl is the test, `deploy.sh`
runs it on every deploy, and it is the reason to re-run it after any edit to
`deploy/nginx/partner.mavioglobal.com.conf`.

Then the SPA fallback:

```bash
curl -sI https://partner.mavioglobal.com/reset-password | head -1   # 200, not 404
curl -sI http://partner.mavioglobal.com/ | head -1                 # 301 to https
```

`/reset-password` is a mailed link, so a 404 there is a partner who cannot set their
password.

## Notes

- `VITE_API_URL` must stay **unset** — same reasoning as the internal portal. Requests
  are same-origin so the httpOnly `partner_session` cookie needs no CORS credentials.
- The backend's three `SUPPLIER_PORTAL_URL` / `BUYER_PORTAL_URL` /
  `LOGISTICS_CHA_PORTAL_URL` settings should all be
  `https://partner.mavioglobal.com`. They only decide which URL staff mail a partner,
  never what the page renders.
