# Two stages because the runtime needs none of node: `vite build` emits a directory of
# static files, and shipping the toolchain that produced them would mean a ~400 MB image
# with a package manager in it for something nginx serves in 20 MB.
FROM node:24-alpine AS build

WORKDIR /app

# Manifests first: this layer is cached until a dependency actually changes, so an
# ordinary code deploy re-runs COPY and `vite build` but not the install.
COPY package.json package-lock.json ./
# `ci` not `install` — it installs exactly the lockfile and fails if package.json has
# drifted from it, rather than silently resolving a newer minor on the box.
RUN npm ci

COPY . .

# No VITE_API_URL on purpose. Every VITE_* is inlined into the public bundle at build
# time, and src/services/http.js falls back to a relative '/api'. Leaving it unset is
# what makes requests same-origin, which is what lets the httpOnly session cookie ride
# along with SameSite=lax and no CORS credentials. Baking an absolute API origin in here
# would break all three at once. The host nginx maps /api to the backend; see
# deploy/nginx/ in the backend repo.
RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
