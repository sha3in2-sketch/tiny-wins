# ✨ Tiny Wins - Real-Time Habit & Task Tracker

**Tiny Wins** is a calm, focused daily to-do list and weekly habit planner with real-time multi-device synchronization and persistent memory.

---

## 🚀 How to Run on Your Laptop

### Quick Start (Windows)
Double-click **`start.bat`** in the project folder, or run in your terminal:

```bash
npm start
```

Then open your browser to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📱 How to Run & Install on Your Phone (Live Sync)

1. Ensure your **phone** and **laptop** are connected to the same **Wi-Fi network**.
2. On your laptop, open **Tiny Wins** and click the **`📱 Phone`** button in the header.
3. A QR code and link will appear (e.g. `http://192.168.x.x:3000`).
4. **Scan the QR Code** with your phone's camera (or open the link).
5. **Install as an App**:
   - **iPhone (Safari)**: Tap the **Share** button (box with arrow pointing up) ➔ scroll and tap **"Add to Home Screen"**.
   - **Android (Chrome)**: Tap the menu (three dots) ➔ tap **"Install App"** or **"Add to Home screen"**.
6. **Done!** Tiny Wins will appear on your home screen with its own app icon and launch full-screen.
7. Any tasks you type, check off, or change on your phone will **instantly appear on your laptop**, and vice-versa.

---

## 💻 How to Install on Your Laptop (Desktop App)

- In **Chrome** or **Microsoft Edge**:
  - Click the **`📲 Install`** button in the app header, or
  - Click the **Install Tiny Wins** icon in your browser's address bar.
- Tiny Wins will install as a standalone desktop application with its own window and taskbar shortcut.

---

## 🌟 Features Included

### 📅 Daily List
- **Evening Routine**: Opens on **tomorrow** by default, making it natural to plan tomorrow's tasks each evening.
- **Quick Navigation**: Jump to **Today**, **Tomorrow**, or use **‹ ›** arrows to browse any date.
- **Progress Ring**: Animated circular ring showing current day's completion percentage.
- **Habit Tracking**:
  - **🔥 Day Streak** counter.
  - **14-day completion average**.
  - **Interactive 14-day history bar chart**: turns bright green on 100% perfect days. Tap any bar to inspect that day.

### 📋 Weekly Planner
- Always opens on the **current week**, with **today's column highlighted**.
- 7-day Mon–Sun checkboxes for every habit or weekly task.
- **★ Star Priority**: Tap the star to mark high priority. High-priority tasks stay pinned to the top with a pink accent.
- **Overall Weekly Progress**: Live percentage bar.
- **Reset Ticks**: Safety double-tap confirmation prevents accidental wiping.
- **Copy Last Week's Tasks**: Convenient 1-click button when starting a fresh week.
- **‹ › Arrows**: Browse previous or upcoming weeks anytime.

### ⚡ Persistent Memory & Real-time Sync
- Tasks are saved persistently on your laptop's disk (`data/tasks.json`).
- Changes sync live between devices over WebSocket with zero latency.
- Also cached in browser `localStorage` and supported by a service worker for offline resilience.
- No logins, passwords, or authentication required.
