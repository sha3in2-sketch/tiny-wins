# Pantry · Kitchen Operating System

A production-quality, local-first, installable kitchen companion built with React 19, TypeScript, Tailwind CSS, Zustand, Dexie (IndexedDB), and Framer Motion.

---

## Features

- **Local-First & Offline**: 100% of data lives in IndexedDB via Dexie. No remote server, no authentication needed. PWA-ready with offline service worker.
- **Recipe Triaging**: Live calculations show which recipes are **Ready now**, which are **1–2 ingredients away**, and exact missing items.
- **3D Flip Cards**: Smooth CSS 3D perspective cards with progress bars on the front, and missing-first interactive toggle chips on the back.
- **Scalable Pantry**: Categorized collapsible shelves, sticky search with create-on-miss, 3-state item toggling (`have` / `low` / `out`), and collapsible staples.
- **Cook Mode**: Fullscreen step-by-step cooking interface with Screen Wake Lock API and smart per-step timer parsing (e.g. `10 min`).
- **Smart Shopping List**: Auto-aggregates from low/out items with one-click clipboard text export.
- **Command Palette**: `Ctrl+K` / `Cmd+K` keyboard shortcut for jumping across tabs, recipes, and actions.
- **Safe Backup & Restore**: JSON export/import with pre-import diff inspection to prevent silent overwriting.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Run test suite
npm test

# 4. Production build
npm run build
```

---

## Seed Data & Recipes

The app comes seeded with **61 distinct recipes** parsed directly from the prototype into `src/db/seedRecipes.json`. On initial load, the Dexie database seeds these recipes and categorizes all **109 pantry items**.
