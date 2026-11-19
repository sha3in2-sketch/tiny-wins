/* ==========================================================================
   TINYWINS OS — CENTRAL STORE
   ========================================================================== */
import { key, today, mon, add, dt } from './utils/date.js';

export const OLD_STORAGE_KEY = 'tinywins.v1';
export const NEW_STORAGE_KEY = 'tinywins_os.v1';
export const ROOM_KEY = 'tinywins.room_id';

// Base initial state
export const STATE = {
  days: {},        // { [dateKey]: [{ id, t, d, priority, time, note, projectId }] }
  weeks: {},       // { [weekKey]: [{ id, t, hi, c: [7 booleans] }] }
  events: {},      // { [dateKey]: [{ id, title, start, end, color, source, url }] }
  notes: {},       // { [dateKey]: { body, mood, energy, updatedAt } }
  projects: [],    // [{ id, name, emoji, color, tasks: [{ id, t, status }] }]
  pomodoro: {
    active: false,
    taskId: null,
    taskTitle: '',
    timeLeft: 25 * 60,
    totalDuration: 25 * 60,
    timerId: null
  },
  ui: {
    tab: 'today',             // 'today' | 'calendar' | 'tasks' | 'journal' | 'projects' | 'settings'
    sel: today(),             // selected day key
    wk: key(mon(new Date())), // selected week key
    calYear: new Date().getFullYear(),
    calMonth: new Date().getMonth(),
    calView: 'month',         // 'month' | 'week'
    showModal: null,          // null | 'pairing' | 'dayDetail' | 'newProject'
    detailDate: today(),      // date selected in calendar
    popId: null               // animation target id
  }
};

// Listeners for store changes
const listeners = new Set();

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function notify() {
  listeners.forEach((fn) => {
    try { fn(STATE); } catch (e) { console.error('Store listener error:', e); }
  });
}

// Load and migrate state from localStorage
export function loadState() {
  try {
    // 1. Try loading modern OS state
    const saved = localStorage.getItem(NEW_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        Object.assign(STATE.days, parsed.days || {});
        Object.assign(STATE.weeks, parsed.weeks || {});
        Object.assign(STATE.events, parsed.events || {});
        Object.assign(STATE.notes, parsed.notes || {});
        if (Array.isArray(parsed.projects)) STATE.projects = parsed.projects;
      }
    }

    // 2. Backward compatibility migration from original Tiny Wins
    const oldSaved = localStorage.getItem(OLD_STORAGE_KEY);
    if (oldSaved) {
      const oldParsed = JSON.parse(oldSaved);
      if (oldParsed && typeof oldParsed === 'object') {
        // Merge without overwriting existing new tasks
        for (const [k, list] of Object.entries(oldParsed.days || {})) {
          if (!STATE.days[k] || !STATE.days[k].length) {
            STATE.days[k] = list;
          }
        }
        for (const [wkKey, wList] of Object.entries(oldParsed.weeks || {})) {
          if (!STATE.weeks[wkKey] || !STATE.weeks[wkKey].length) {
            STATE.weeks[wkKey] = wList;
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
  }
}

// Save state to localStorage immediately
export function saveState() {
  try {
    const payload = {
      days: STATE.days,
      weeks: STATE.weeks,
      events: STATE.events,
      notes: STATE.notes,
      projects: STATE.projects
    };
    localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(payload));
    // Also keep old key in sync for backward compatibility
    localStorage.setItem(OLD_STORAGE_KEY, JSON.stringify({ days: STATE.days, weeks: STATE.weeks }));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
  notify();
}

// Room ID management
export function getRoomId() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramRoom = urlParams.get('room');
  if (paramRoom && paramRoom.trim()) {
    const cleanRoom = paramRoom.trim();
    localStorage.setItem(ROOM_KEY, cleanRoom);
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
    return cleanRoom;
  }
  let saved = localStorage.getItem(ROOM_KEY);
  if (!saved) {
    saved = 'tiny-' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem(ROOM_KEY, saved);
  }
  return saved;
}

export function setRoomId(newRoom) {
  if (!newRoom || !newRoom.trim()) return;
  localStorage.setItem(ROOM_KEY, newRoom.trim());
}

// Helper computations
export const tasks = (k) => STATE.days[k] || [];

export const pct = (k) => {
  const t = tasks(k);
  return t.length ? t.filter((x) => x.d).length / t.length : null;
};

export function streak() {
  let n = 0;
  let d = new Date();
  if (pct(key(d)) !== 1) d = add(d, -1);
  while (pct(key(d)) === 1) {
    n++;
    d = add(d, -1);
  }
  return n;
}
