// The one place a kind's user-facing brand strings live — the partner-side twin of the
// internal portal's config/kinds.js. Deliberately a data table read at RUNTIME off
// `me.kind`, not a build-time flag: one static build is served on all three
// hostnames, and the session already knows which kind logged in, so a build flag could
// only ever disagree with it. See CLAUDE.md for the fuller reasoning.
export const PORTALS = {
  supplier: {
    brand: 'Mavio Supplier Portal',
  },
  buyer: {
    brand: 'Mavio Buyer Portal',
  },
  logistics_cha: {
    brand: 'Mavio Logistics Portal',
  },
}

// A generic fallback for the two screens that render before login resolves a kind at
// all (LoginPage, SetPasswordPage) — there is nothing wrong to disambiguate yet.
export const DEFAULT_BRAND = 'Mavio Global — Partner Portal'
