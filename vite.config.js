import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5181,
    // strictPort, same reasoning as the internal portal: several dev servers live in
    // this range, and silently walking up to the next free port makes "it started fine"
    // mean nothing.
    strictPort: true,
    // Vite 8 refuses requests addressed to a Host it wasn't told about; a tunnel
    // hostname is by definition unknown, so every ngrok request would 403 with
    // "Blocked request". Dev-server only — `vite build` output never reads this.
    allowedHosts: true,
    proxy: {
      // Same-origin in dev and prod, so the session cookie needs no CORS credentials.
      // In production, a partner hostname's proxy should route ONLY /api/portal and
      // /api/review to the backend — never the rest of /api. See backend/app/main.py.
      '/api': { target: 'http://127.0.0.1:8002', changeOrigin: true },
    },
  },
})
