/* ==========================================================================
   TINYWINS OS — ROUTER
   ========================================================================== */
import { STATE, notify } from './store.js';

export const VALID_TABS = ['today', 'calendar', 'tasks', 'journal', 'projects', 'settings'];

export function initRouter() {
  function handleHash() {
    const hash = window.location.hash.replace('#', '').trim();
    if (VALID_TABS.includes(hash)) {
      STATE.ui.tab = hash;
    } else {
      STATE.ui.tab = 'today';
      window.location.hash = '#today';
    }
    notify();
  }

  window.addEventListener('hashchange', handleHash);
  if (!window.location.hash) {
    window.location.hash = '#today';
  } else {
    handleHash();
  }
}

export function navigate(tabName) {
  if (VALID_TABS.includes(tabName)) {
    window.location.hash = '#' + tabName;
  }
}
