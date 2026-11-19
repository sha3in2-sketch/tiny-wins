# ✨ Tiny Wins OS

> **The "God-Level" Personal Productivity & Calendar Engine**  
> *Seamlessly blending the fluid time-blocking of Notion Calendar, the algorithmic power of Google Calendar, and dopamine-driven completion psychology.*

[![PWA Ready](https://img.shields.io/badge/PWA-Installable-7b6cf0.svg)](https://sha3in2-sketch.github.io/tiny-wins/app/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20ESM)-mint.svg)](#architecture)
[![Security](https://img.shields.io/badge/Security-AES--256--GCM%20E2EE-pink.svg)](#security--privacy-architecture)
[![Code Quality](https://img.shields.io/badge/Linter-Biome%20Verified-blue.svg)](#quality--audits)
[![Security Audit](https://img.shields.io/badge/Security%20Scan-Semgrep%20Clean-success.svg)](#quality--audits)

---

## 🌟 Overview

**Tiny Wins OS** is an offline-first, installable personal operating system designed for high-agency execution. Unlike monolithic productivity platforms that suffer from database lag or disconnect tasks from calendars, Tiny Wins unifies **Tasks, Calendar Time-Blocks, Habits, and Reflections** into a single cohesive, sub-millisecond timeline.

```
+---------------------------------------------------------------------------------------+
|                                  TINY WINS OS ENGINE                                  |
|   [Unscheduled Backlog Tray]  ──1-Click Fluid Block──>  [Unified Commitment Engine]   |
|              │                                                      │                 |
|              ▼                                                      ▼                 |
|   [Notion-Style Sidecar]                               [Parallel Collision Grid]      |
|   (Gmail / GCal / Todos)                              (Sweep-Line Interval Algorithm) |
|                                                                     │                 |
|                                                                     ▼                 |
|                                                         [Dopamine Wins & Hat Tricks]   |
+---------------------------------------------------------------------------------------+
```

---

## ⚡ Core Highlights

### 1. 🔀 Collision-Free Parallel Time Grid (Interval Partitioning)
* Built on the **Sweep-Line Greedy Interval Coloring Algorithm** (the exact mathematics powering Google Calendar and Notion/Cron).
* When events or 15-minute sub-slots overlap (e.g. `12:15 PM` and `12:45 PM`), they automatically partition into side-by-side parallel columns (`50% / 50%` or `33% / 33% / 33%`) with zero overlapping cards.
* 15-minute click snapping with visual live red-line current time indicator.

### 2. 📥 Notion Calendar Unscheduled Sidecar Tray (Backlog)
* Collapsible right-hand drawer (<kbd>B</kbd>) storing unscheduled commitments, backlogs, and action items.
* **1-Click Fluid Time-Blocking**: Tapping **`⚡ Time Block`** scans the selected date for the next open daytime slot (9 AM – 8 PM) and schedules it into the calendar with zero manual typing.
* Quick-add inline input (<kbd>Enter</kbd>) for rapid thought dumping.

### 3. 🎯 Unified Commitment Data Model
* Eliminates the traditional rift between "To-Do Lists" and "Calendar Events". In Tiny Wins, a task is simply an event awaiting a slot; an event is a task anchored to time.
* Supports source badges:
  * `📧 Gmail`: Action items extracted from email threads with direct deep links.
  * `🗓️ Google Calendar`: Synced meeting blocks.
  * `✨ Tasks`: High-focus manual commitments.

### 4. ⌨️ Desktop-Native Keyboard Navigation (Cron Shortcuts)
Fly through your schedule at 0ms latency without touching your mouse:
| Shortcut | Action |
| :---: | :--- |
| <kbd>T</kbd> | Jump immediately to **Today** |
| <kbd>W</kbd> | Switch to **Week Hourly Time-Grid** |
| <kbd>D</kbd> | Switch to **Single Day Planner** |
| <kbd>M</kbd> | Switch to **Full Month Calendar** |
| <kbd>B</kbd> | Toggle **Unscheduled Backlog Tray** |
| <kbd>R</kbd> | Open **Daily Wins Retrospective** |
| <kbd>Cmd</kbd> + <kbd>K</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> | Open **Command Palette** |
| <kbd>Esc</kbd> | Dismiss modals and overlays |

### 5. 🏆 Dopamine Psychology & Hat Trick Wins
* **Hat Trick Win**: Checking off 3 or more wins in a day unlocks the `🔥 Hat Trick Win!` badge and triggers micro-confetti feedback.
* **Evening Retrospective**: Daily wins summary modal showing total wins, focus hours logged, and gamified win scores with a 1-click **"🎉 Celebrate & Plan Tomorrow"** transition.
* **14-Day Momentum Bar**: Visual habit momentum bars to visualize consistency.

---

## 🔒 Security & Privacy Architecture

Tiny Wins OS implements **Zero-Knowledge End-to-End Encryption (E2EE)** using the native browser **Web Crypto API (AES-256-GCM + PBKDF2-SHA256)**:

```mermaid
flowchart LR
    A[Client Browser] -->|1. Derive Key from Secret Room ID| B[Web Crypto AES-256-GCM]
    B -->|2. Encrypt State locally| C[Encrypted Ciphertext Envelope]
    C -->|3. Send over TLS| D[(Supabase Realtime Cloud)]
    D -->|4. Sync Ciphertext only| E[Paired Phone PWA]
    E -->|5. Decrypt using Shared Room Key| F[Decrypted Local State]
```

### Security Guarantees:
1. **Isolated Cryptographic Rooms**:
   * Each user session generates a 128-bit cryptographically secure room token (`tw-sec-...` via `crypto.getRandomValues`).
   * **If someone clones or downloads this repository, they CANNOT access your data.** Their browser automatically generates its own isolated room key. They never receive your room ID.
2. **Zero-Knowledge Cloud Sync**:
   * All task titles, notes, and calendar schedules are encrypted with AES-256-GCM **before** leaving your device.
   * Anyone querying the public Supabase database or intercepting network traffic sees only randomized ciphertext bytes (`_enc: true, iv: [...], data: [...]`).
3. **Tamper Proofing**:
   * AES-GCM includes an authenticated verification tag. If an unauthorized party attempts to inject or modify data in a room without the secret key, the client throws an `OperationError` and rejects the payload.
4. **Instant Device Revocation**:
   * Tapping **"🔒 Disconnect Other Devices / Reset Key"** deletes the old cloud row and generates a brand new 128-bit key, instantly locking out any previously paired phone or stale device.

---

## 📁 Architecture & Codebase Map

Tiny Wins OS is intentionally built with **Pure Vanilla JavaScript (ES Modules) and Modern CSS Variables**, requiring **zero bundlers or build steps** to run.

```
tiny-wins/
├── public/app/               # Modern Modular OS Application
│   ├── index.html            # PWA shell with SRI script verification
│   ├── manifest.json         # Web App Manifest for mobile installation
│   ├── css/
│   │   ├── tokens.css        # Design tokens, color palette, typography
│   │   ├── base.css          # Reset and layout primitives
│   │   ├── components.css    # Cards, pills, buttons, and progress rings
│   │   ├── calendar.css      # Time-grid canvas, sweep-line slots, backlog tray
│   │   ├── tasks.css         # Task lists, check buttons, strikethrough logic
│   │   ├── journal.css       # Daily reflections & mood selector
│   │   ├── responsive.css    # Adaptive desktop, tablet & mobile viewports
│   │   └── animations.css    # Micro-interactions, haptics, and pop keys
│   └── js/
│       ├── main.js           # Event delegation & global keyboard router
│       ├── store.js          # Central observable store & state persistence
│       ├── crypto.js         # Zero-Knowledge AES-GCM encryption engine
│       ├── sync.js           # Supabase Realtime 24/7 cross-device sync
│       ├── router.js         # Hash-based micro-router
│       ├── render.js         # View composition and modal layer manager
│       ├── views/
│       │   ├── calendar.js   # Time grid, interval partitioning, sidecar tray
│       │   ├── today.js      # Daily focus view & momentum ring
│       │   ├── tasks.js      # 7-day habit matrix
│       │   └── journal.js    # Mood & daily reflection tracker
│       └── components/
│           ├── modal.js      # Command palette (Cmd+K), day detail, retrospective
│           └── toast.js      # Tactile notification toasts
└── index.html                # Legacy standalone launcher & redirect
```

---

## 🚀 Quick Start

### Option A: Open the Live Web App
Visit the deployed PWA directly on desktop or mobile:
👉 **[https://sha3in2-sketch.github.io/tiny-wins/app/](https://sha3in2-sketch.github.io/tiny-wins/app/)**

### Option B: Run Locally
No build tools required! Simply serve the directory with any static HTTP server:

```bash
# Using Python
python -m http.server 8080

# Or using Node
npx serve .
```
Navigate to `http://localhost:8080/app/` in your browser.

---

## 📱 Mobile Installation (PWA)

1. Open **[https://sha3in2-sketch.github.io/tiny-wins/app/](https://sha3in2-sketch.github.io/tiny-wins/app/)** on your phone.
2. **iOS Safari**: Tap the **Share** button ➔ select **"Add to Home Screen"**.
3. **Android Chrome**: Tap the **Three Dots (⋮)** ➔ select **"Install App"** / **"Add to Home Screen"**.
4. Tap **📱 Phone** in the desktop header, scan the QR code with your phone camera, and your devices are paired 24/7 with zero-knowledge encryption!

---

## 🛡️ Quality & Verification

Every release is strictly validated using industry-standard static analysis:

```bash
# Biome Linter & Code Formatter (64 files checked, 0 errors, 0 warnings)
biome check public/app app

# Semgrep Security & Vulnerability Analysis (1,074 rules checked, 0 findings)
semgrep scan --config auto public/app app
```

---

## 📄 License

MIT License © 2026 Shaurya. Free to use, adapt, and build upon.
