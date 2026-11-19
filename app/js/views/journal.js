/* ==========================================================================
   TINYWINS OS — JOURNAL & NOTES VIEW
   ========================================================================== */
import { STATE } from '../store.js';
import { today, L, dt, rel } from '../utils/date.js';

export function renderJournalView() {
  const activeDate = STATE.ui.sel || today();
  const entry = STATE.notes[activeDate] || { body: '', mood: 3, energy: 3 };

  const moods = [
    { score: 1, emoji: '😴', label: 'Tired' },
    { score: 2, emoji: '😐', label: 'Okay' },
    { score: 3, emoji: '🙂', label: 'Good' },
    { score: 4, emoji: '😊', label: 'Great' },
    { score: 5, emoji: '🤩', label: 'Fire' }
  ];

  return `
    <section class="card">
      <div class="card-header">
        <div>
          <h2>Daily Journal & Thoughts</h2>
          <span class="chip mint">${L(dt(activeDate), { weekday: 'long', day: 'numeric', month: 'long' })}</span>
        </div>
        <span class="journal-saved-hint" id="journal-saved-indicator">✓ Auto-saved locally</span>
      </div>

      <!-- Mood & Energy Selector -->
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;margin-bottom:16px;">
        <div>
          <span style="font-size:13px;font-weight:700;color:var(--mute);display:block;margin-bottom:6px">HOW WAS YOUR MOOD?</span>
          <div class="journal-mood-row">
            ${moods.map((m) => `
              <button
                class="mood-btn ${entry.mood === m.score ? 'selected' : ''}"
                data-action="set-mood"
                data-score="${m.score}"
                data-date="${activeDate}"
                title="${m.label}"
              >
                ${m.emoji}
              </button>
            `).join('')}
          </div>
        </div>

        <div>
          <span style="font-size:13px;font-weight:700;color:var(--mute);display:block;margin-bottom:6px">ENERGY LEVEL (1–5)</span>
          <div class="energy-slider-group">
            <span>⚡</span>
            <input
              type="range"
              min="1"
              max="5"
              value="${entry.energy || 3}"
              data-action="set-energy"
              data-date="${activeDate}"
            />
            <b>${entry.energy || 3}/5</b>
          </div>
        </div>
      </div>

      <!-- Journal Freetext Area -->
      <textarea
        id="journal-input"
        class="journal-textarea"
        placeholder="What did you learn today? What went well? Write freely without pressure..."
        data-date="${activeDate}"
      >${entry.body || ''}</textarea>
    </section>
  `;
}
