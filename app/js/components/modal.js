/* ==========================================================================
   TINYWINS OS — MODAL DIALOGS
   ========================================================================== */
import { STATE, getRoomId, tasks } from '../store.js';
import { L, dt, rel, today } from '../utils/date.js';
import { esc } from '../utils/escape.js';

export function getPairingUrl() {
  const currentRoomId = getRoomId();
  // Check if deployed on GitHub Pages or local
  const base = window.location.href.split('?')[0];
  return `${base}?room=${currentRoomId}`;
}

export function renderModalRoot() {
  const modalType = STATE.ui.showModal;
  if (!modalType) return '';

  if (modalType === 'pairing') {
    const pairUrl = getPairingUrl();
    const currentRoomId = getRoomId();
    return `
      <div class="modal-backdrop" id="modal-backdrop" data-action="close-modal">
        <div class="modal-card" onclick="event.stopPropagation()">
          <button class="modal-close" data-action="close-modal" aria-label="Close">×</button>
          <h2 style="font-size:24px;margin-bottom:4px">📱 24/7 Phone Sync</h2>
          <p class="hint" style="color:var(--mute);font-size:14px;margin:0 0 10px">Works even when your laptop is completely turned off!</p>

          <div class="qr-frame" style="background:#fff;border:2px dashed var(--line);border-radius:20px;padding:14px;display:inline-block;margin:10px 0;">
            <canvas id="qr-canvas" style="display:block;width:180px;height:180px;margin:0 auto;border-radius:10px;"></canvas>
          </div>

          <div style="background:var(--bg);border:1.5px solid var(--line);border-radius:14px;padding:8px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px;font-size:12px;font-weight:600;word-break:break-all;">
            <span style="font-size:12px">${pairUrl}</span>
            <button class="pill" data-action="copy-pair-url" data-url="${pairUrl}" style="padding:4px 10px;font-size:12px;flex:none;">Copy Link</button>
          </div>

          <div style="display:flex;align-items:center;justify-content:center;gap:8px;background:var(--pl);border-radius:12px;padding:6px 12px;font-size:13px;font-weight:700;color:var(--p);margin-bottom:12px;">
            <span>Room:</span>
            <input id="room-input-modal" value="${currentRoomId}" maxlength="28" style="border:1px solid var(--line);background:#fff;border-radius:8px;padding:3px 8px;font-size:13px;width:140px;text-align:center;color:var(--ink)" />
            <button class="pill" data-action="change-room-code" style="padding:3px 10px;font-size:12px">Save</button>
          </div>

          <button data-action="revoke-room-devices" style="background:var(--pink);color:#fff;border:0;font-weight:600;font-size:13px;border-radius:var(--radius-pill);padding:10px 16px;margin:8px 0 14px;width:100%;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 4px 12px rgba(255,111,168,0.3)">
            🔒 Disconnect Other Devices / Reset Key
          </button>

          <div style="text-align:left;background:var(--pl);border-radius:16px;padding:12px 14px;font-size:13px;color:var(--ink);line-height:1.45">
            <b style="color:var(--p)">📲 How to use as an app on your phone:</b><br>
            1. <b>Scan the QR code</b> with your phone's camera.<br>
            2. <b>iPhone:</b> Tap Share ➔ Add to Home Screen.<br>
            3. <b>Android:</b> Tap menu ➔ Install app / Add to Home screen.<br>
            4. <b>All updates sync 24/7 in real time</b> across all devices.
          </div>
        </div>
      </div>
    `;
  }

  if (modalType === 'dayDetail') {
    const selDate = STATE.ui.detailDate || today();
    const dTasks = tasks(selDate);
    const dateLabel = L(dt(selDate), { weekday: 'long', day: 'numeric', month: 'long' });
    const relativeLabel = rel(selDate);

    return `
      <div class="modal-backdrop" id="modal-backdrop" data-action="close-modal">
        <div class="modal-card" style="text-align:left;max-width:540px" onclick="event.stopPropagation()">
          <button class="modal-close" data-action="close-modal" aria-label="Close">×</button>
          <div style="margin-bottom:16px">
            <h2 style="font-size:22px">${dateLabel} ${relativeLabel ? `<span class="chip">${relativeLabel}</span>` : ''}</h2>
            <p style="color:var(--mute);font-size:14px;margin:4px 0 0">Manage tasks and events for this date</p>
          </div>

          <div class="input-row">
            <input id="detail-task-input" class="input-text" placeholder="Add task for this day..." maxlength="120" />
            <button class="btn-primary" data-action="add-detail-task" data-date="${selDate}">Add</button>
          </div>

          <div style="display:flex;gap:8px;margin-bottom:14px;align-items:center">
            <button class="pill secondary" id="priority-toggle-btn" data-action="toggle-detail-priority" data-priority="normal">★ Normal</button>
            <input type="time" id="detail-time-input" style="border:1.5px solid var(--line);border-radius:10px;padding:5px 8px;font-size:13px;color:var(--ink)" />
          </div>

          <div style="max-height:300px;overflow-y:auto;padding-right:4px">
            ${dTasks.length ? dTasks.map((t) => `
              <div class="task-row ${t.d ? 'done' : ''} ${t.priority === 'high' ? 'priority-high' : t.priority === 'med' ? 'priority-med' : ''}">
                <button class="task-check ${t.d ? 'done' : ''}" data-action="toggle-task-done" data-id="${t.id}" data-date="${selDate}">
                  ${t.d ? '✓' : ''}
                </button>
                <span class="task-text">
                  ${t.time ? `<span class="task-time-chip">${t.time}</span>` : ''}
                  ${esc(t.t)}
                </span>
                <button class="task-del-btn" data-action="delete-task" data-id="${t.id}" data-date="${selDate}">×</button>
              </div>
            `).join('') : '<p style="color:var(--mute);font-size:14px;text-align:center;padding:20px 0">No tasks on this date yet.</p>'}
          </div>
        </div>
      </div>
    `;
  }

  return '';
}

// Draw QR code onto canvas if present
export function attachQrCode() {
  const canvas = document.getElementById('qr-canvas');
  if (canvas && window.QRCode) {
    const pairUrl = getPairingUrl();
    window.QRCode.toCanvas(
      canvas,
      pairUrl,
      {
        width: 180,
        margin: 1,
        color: { dark: '#2b2850', light: '#ffffff' }
      },
      (err) => {
        if (err) console.error('QR generation error:', err);
      }
    );
  }
}
