/* ==========================================================================
   TINYWINS OS — MAIN ENTRY POINT & EVENT DELEGATION
   ========================================================================== */
import {
  STATE,
  loadState,
  saveState,
  subscribe,
  pct
} from './store.js';
import {
  initSync,
  debouncedPush,
  switchRoom,
  revokeAndRegenerateRoom,
  onSyncStatusChange
} from './sync.js';
import { initRouter, navigate } from './router.js';
import { renderApp } from './render.js';
import { showToast } from './components/toast.js';
import { fireConfetti } from './components/confetti.js';
import { uid } from './utils/uid.js';
import { today, add, mon, key, dt, pad } from './utils/date.js';
import { formatTimeLabel } from './views/calendar.js';

// 1. Initial State Load & Cloud Boot
loadState();

// Seed initial Notion-like time-grid blocks for today if empty, so the user sees immediate beauty
const tdKey = today();
if (!STATE.days[tdKey] || STATE.days[tdKey].length === 0) {
  STATE.days[tdKey] = [
    {
      id: uid(),
      t: 'Deep Work: System Architecture',
      d: false,
      priority: 'high',
      time: '10:00 AM',
      duration: 60,
      createdAt: new Date().toISOString()
    },
    {
      id: uid(),
      t: 'qsq',
      d: false,
      priority: 'normal',
      time: '12:15 PM',
      duration: 30,
      createdAt: new Date().toISOString()
    },
    {
      id: uid(),
      t: 'qb',
      d: false,
      priority: 'normal',
      time: '12:45 PM',
      duration: 30,
      createdAt: new Date().toISOString()
    }
  ];
  saveState();
}

initSync();
initRouter();

// 2. Subscribe render loop to store & sync changes
subscribe(() => {
  renderApp();
});

onSyncStatusChange(() => {
  renderApp();
});

// Initial Render
renderApp();

// Helper to scroll time grid to daytime (e.g. 9 AM)
function autoScrollTimeGrid() {
  setTimeout(() => {
    const scrollEl = document.getElementById('time-grid-scroll');
    if (scrollEl) {
      // 9 AM is 2 hours after 7 AM = 2 * 64 = 128px
      const now = new Date();
      const currentH = now.getHours();
      const targetH = Math.max(currentH - 1, 8);
      scrollEl.scrollTop = Math.max((targetH - 7) * 64 - 20, 0);
    }
  }, 60);
}
autoScrollTimeGrid();

// 3. Global Event Delegation
document.addEventListener('click', async (e) => {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;
  const id = target.dataset.id;
  const dateKey = target.dataset.date;

  // --- Modal actions ---
  if (action === 'open-pairing-modal') {
    STATE.ui.showModal = 'pairing';
    renderApp();
    return;
  }

  if (action === 'close-modal') {
    STATE.ui.showModal = null;
    renderApp();
    return;
  }

  if (action === 'copy-pair-url') {
    const url = target.dataset.url;
    if (url) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied to clipboard! 📋', 'success');
      });
    }
    return;
  }

  if (action === 'change-room-code') {
    const input = document.getElementById('room-input-modal');
    if (input && input.value.trim()) {
      switchRoom(input.value.trim());
      showToast('Switched to room: ' + input.value.trim(), 'success');
      STATE.ui.showModal = null;
      renderApp();
    }
    return;
  }

  if (action === 'revoke-room-devices') {
    if (
      confirm(
        'Disconnect all other phones and devices that scanned the previous QR code? You will need to scan the new QR code on your phone.'
      )
    ) {
      await revokeAndRegenerateRoom();
      showToast('New room key generated! Other devices disconnected.', 'success');
      renderApp();
    }
    return;
  }

  // --- Date navigation in Today view ---
  if (action === 'prev-day') {
    STATE.ui.sel = key(add(dt(STATE.ui.sel || today()), -1));
    saveState();
    return;
  }
  if (action === 'next-day') {
    STATE.ui.sel = key(add(dt(STATE.ui.sel || today()), 1));
    saveState();
    return;
  }
  if (action === 'go-today') {
    STATE.ui.sel = today();
    saveState();
    return;
  }
  if (action === 'go-tomorrow') {
    STATE.ui.sel = key(add(new Date(), 1));
    saveState();
    return;
  }
  if (action === 'select-day') {
    STATE.ui.sel = target.dataset.key;
    saveState();
    return;
  }

  // --- Task Operations in Today & Day Detail ---
  if (action === 'add-today-task') {
    const input = document.getElementById('today-task-input');
    const priorityBtn = document.getElementById('today-priority-btn');
    const priority = priorityBtn ? priorityBtn.dataset.priority : 'normal';
    const text = input ? input.value.trim() : '';

    if (!text) return;
    const selDate = STATE.ui.sel || today();
    STATE.days[selDate] = STATE.days[selDate] || [];
    STATE.days[selDate].push({
      id: uid(),
      t: text,
      d: false,
      priority: priority,
      createdAt: new Date().toISOString()
    });

    input.value = '';
    saveState();
    debouncedPush();
    return;
  }

  if (action === 'cycle-priority') {
    const current = target.dataset.priority || 'normal';
    const next = current === 'normal' ? 'high' : current === 'high' ? 'med' : 'normal';
    target.dataset.priority = next;
    target.innerText = next === 'high' ? '★ High' : next === 'med' ? '★ Medium' : '★ Normal';
    target.className =
      next === 'high'
        ? 'pill active'
        : next === 'med'
        ? 'pill secondary'
        : 'pill secondary';
    return;
  }

  if (action === 'toggle-task-done') {
    const date = dateKey || STATE.ui.sel || today();
    const list = STATE.days[date] || [];
    const task = list.find((t) => t.id === id);
    if (task) {
      task.d = !task.d;
      STATE.ui.popId = task.d ? id : null;
      saveState();
      debouncedPush();

      if (task.d) {
        if (pct(date) === 1) {
          fireConfetti();
          showToast('🎉 Perfect day! All tasks complete!', 'success');
        }
      }
    }
    return;
  }

  if (action === 'delete-task') {
    const date = dateKey || STATE.ui.sel || today();
    if (STATE.days[date]) {
      STATE.days[date] = STATE.days[date].filter((t) => t.id !== id);
      saveState();
      debouncedPush();
    }
    return;
  }

  // --- Calendar Specific Actions & Time-Grid Sub-Slot Creation ---
  if (action === 'set-cal-mode') {
    STATE.ui.calView = target.dataset.mode;
    renderApp();
    autoScrollTimeGrid();
    return;
  }

  // CLICKING A TIME SLOT TO CREATE A "SLOT INSIDE A SLOT"
  if (action === 'slot-click') {
    const targetDate = target.dataset.date || today();
    const hour = parseInt(target.dataset.hour, 10);

    // Calculate click vertical offset to determine quarter hour (00, 15, 30, 45 min)
    const rect = target.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const ratio = Math.max(0, Math.min(clickY / rect.height, 0.99));

    let minute = 0;
    if (ratio < 0.25) minute = 0;
    else if (ratio < 0.5) minute = 15;
    else if (ratio < 0.75) minute = 30;
    else minute = 45;

    const formattedTime = formatTimeLabel(hour, minute);

    // Prompt user for slot title with pre-filled time
    const taskTitle = prompt(
      `Add time-blocked slot at ${formattedTime} (${targetDate}):\n(e.g., Deep Work, Team Sync, Study, Gym)`
    );

    if (taskTitle && taskTitle.trim()) {
      STATE.days[targetDate] = STATE.days[targetDate] || [];
      STATE.days[targetDate].push({
        id: uid(),
        t: taskTitle.trim(),
        d: false,
        priority: 'normal',
        time: formattedTime,
        duration: 30, // 30 mins slot
        createdAt: new Date().toISOString()
      });

      saveState();
      debouncedPush();
      showToast(`Added slot "${taskTitle.trim()}" at ${formattedTime} ✨`, 'success');
    }
    return;
  }

  if (action === 'cal-prev') {
    if (STATE.ui.calView === 'timegrid') {
      STATE.ui.sel = key(add(dt(STATE.ui.sel || today()), -7));
    } else if (STATE.ui.calView === 'daygrid') {
      STATE.ui.sel = key(add(dt(STATE.ui.sel || today()), -1));
    } else {
      if (STATE.ui.calMonth === 0) {
        STATE.ui.calMonth = 11;
        STATE.ui.calYear--;
      } else {
        STATE.ui.calMonth--;
      }
    }
    renderApp();
    autoScrollTimeGrid();
    return;
  }

  if (action === 'cal-next') {
    if (STATE.ui.calView === 'timegrid') {
      STATE.ui.sel = key(add(dt(STATE.ui.sel || today()), 7));
    } else if (STATE.ui.calView === 'daygrid') {
      STATE.ui.sel = key(add(dt(STATE.ui.sel || today()), 1));
    } else {
      if (STATE.ui.calMonth === 11) {
        STATE.ui.calMonth = 0;
        STATE.ui.calYear++;
      } else {
        STATE.ui.calMonth++;
      }
    }
    renderApp();
    autoScrollTimeGrid();
    return;
  }

  if (action === 'cal-today') {
    STATE.ui.calYear = new Date().getFullYear();
    STATE.ui.calMonth = new Date().getMonth();
    STATE.ui.sel = today();
    renderApp();
    autoScrollTimeGrid();
    return;
  }

  if (action === 'open-day-detail') {
    STATE.ui.detailDate = target.dataset.date;
    STATE.ui.showModal = 'dayDetail';
    renderApp();
    return;
  }

  if (action === 'add-detail-task') {
    const input = document.getElementById('detail-task-input');
    const timeInput = document.getElementById('detail-time-input');
    const priorityBtn = document.getElementById('priority-toggle-btn');
    const text = input ? input.value.trim() : '';
    if (!text) return;

    let timeValue = null;
    if (timeInput && timeInput.value) {
      const [h, m] = timeInput.value.split(':');
      timeValue = formatTimeLabel(parseInt(h, 10), parseInt(m, 10));
    }

    const date = target.dataset.date || today();
    STATE.days[date] = STATE.days[date] || [];
    STATE.days[date].push({
      id: uid(),
      t: text,
      d: false,
      priority: priorityBtn ? priorityBtn.dataset.priority : 'normal',
      time: timeValue,
      duration: 45,
      createdAt: new Date().toISOString()
    });

    input.value = '';
    saveState();
    debouncedPush();
    return;
  }

  // --- Weekly Habits Matrix Actions ---
  if (action === 'prev-week') {
    STATE.ui.wk = key(add(dt(STATE.ui.wk), -7));
    saveState();
    return;
  }
  if (action === 'next-week') {
    STATE.ui.wk = key(add(dt(STATE.ui.wk), 7));
    saveState();
    return;
  }
  if (action === 'this-week') {
    STATE.ui.wk = key(mon(new Date()));
    saveState();
    return;
  }

  if (action === 'add-weekly-habit') {
    const input = document.getElementById('weekly-input');
    const starBtn = document.getElementById('weekly-star-toggle');
    const text = input ? input.value.trim() : '';
    if (!text) return;

    const currentWk = STATE.ui.wk || key(mon(new Date()));
    STATE.weeks[currentWk] = STATE.weeks[currentWk] || [];
    STATE.weeks[currentWk].push({
      id: uid(),
      t: text,
      hi: starBtn ? starBtn.dataset.starred === 'true' : false,
      c: Array(7).fill(false)
    });

    input.value = '';
    if (starBtn) {
      starBtn.dataset.starred = 'false';
      starBtn.innerText = '★ Star';
      starBtn.className = 'pill secondary';
    }
    saveState();
    debouncedPush();
    return;
  }

  if (action === 'toggle-new-habit-star') {
    const isStarred = target.dataset.starred === 'true';
    target.dataset.starred = (!isStarred).toString();
    target.innerText = !isStarred ? '★ High Priority' : '★ Star';
    target.className = !isStarred ? 'pill active' : 'pill secondary';
    return;
  }

  if (action === 'toggle-habit-star') {
    const currentWk = STATE.ui.wk || key(mon(new Date()));
    const row = (STATE.weeks[currentWk] || []).find((r) => r.id === id);
    if (row) {
      row.hi = !row.hi;
      saveState();
      debouncedPush();
    }
    return;
  }

  if (action === 'toggle-habit-tick') {
    const currentWk = STATE.ui.wk || key(mon(new Date()));
    const dayIdx = parseInt(target.dataset.day, 10);
    const row = (STATE.weeks[currentWk] || []).find((r) => r.id === id);
    if (row && row.c) {
      row.c[dayIdx] = !row.c[dayIdx];
      STATE.ui.popId = row.c[dayIdx] ? id + dayIdx : null;
      saveState();
      debouncedPush();
    }
    return;
  }

  if (action === 'delete-weekly-habit') {
    const currentWk = STATE.ui.wk || key(mon(new Date()));
    if (STATE.weeks[currentWk]) {
      STATE.weeks[currentWk] = STATE.weeks[currentWk].filter((r) => r.id !== id);
      saveState();
      debouncedPush();
    }
    return;
  }

  if (action === 'copy-prev-week') {
    const currentWk = STATE.ui.wk || key(mon(new Date()));
    const prevWk = key(add(dt(currentWk), -7));
    const prevList = STATE.weeks[prevWk] || [];
    STATE.weeks[currentWk] = prevList.map((r) => ({
      ...r,
      id: uid(),
      c: Array(7).fill(false)
    }));
    saveState();
    debouncedPush();
    showToast('Copied habits from last week! ✓', 'success');
    return;
  }

  // --- Journal Actions ---
  if (action === 'set-mood') {
    const score = parseInt(target.dataset.score, 10);
    const date = dateKey || today();
    STATE.notes[date] = STATE.notes[date] || { body: '', mood: 3, energy: 3 };
    STATE.notes[date].mood = score;
    saveState();
    debouncedPush();
    return;
  }

  // --- Settings & Connect Prompts ---
  if (action === 'google-connect-prompt') {
    showToast('Google OAuth scheduled for Phase 3! Ready to connect.', 'info');
    return;
  }

  if (action === 'new-project-prompt') {
    const title = prompt('Enter project name (e.g. AI Portfolio, College Finals):');
    if (title && title.trim()) {
      STATE.projects.push({
        id: uid(),
        name: title.trim(),
        emoji: '📁',
        color: '#7b6cf0',
        tasks: []
      });
      saveState();
      debouncedPush();
      showToast('Project created! 📁', 'success');
    }
    return;
  }
});

// 4. Enter Key Listener for Task Inputs
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (e.target.id === 'today-task-input') {
      const btn = document.querySelector('[data-action="add-today-task"]');
      if (btn) btn.click();
    } else if (e.target.id === 'detail-task-input') {
      const btn = document.querySelector('[data-action="add-detail-task"]');
      if (btn) btn.click();
    } else if (e.target.id === 'weekly-input') {
      const btn = document.querySelector('[data-action="add-weekly-habit"]');
      if (btn) btn.click();
    } else if (e.target.id === 'room-input-modal') {
      const btn = document.querySelector('[data-action="change-room-code"]');
      if (btn) btn.click();
    }
  }

  // Keyboard shortcut: Cmd/Ctrl + K to switch tabs or search
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    navigate(STATE.ui.tab === 'calendar' ? 'today' : 'calendar');
  }

  // Escape closes open modals
  if (e.key === 'Escape') {
    if (STATE.ui.showModal) {
      STATE.ui.showModal = null;
      renderApp();
    }
  }
});

// 5. Journal text input auto-save listener
document.addEventListener('input', (e) => {
  if (e.target.id === 'journal-input') {
    const date = e.target.dataset.date || today();
    STATE.notes[date] = STATE.notes[date] || { body: '', mood: 3, energy: 3 };
    STATE.notes[date].body = e.target.value;
    saveState();
    debouncedPush();
  }
});
