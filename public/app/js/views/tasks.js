/* ==========================================================================
   TINYWINS OS — TASKS & HABIT PLANNER VIEW
   ========================================================================== */
import { STATE } from '../store.js';
import { mon, add, key, dt, today, L } from '../utils/date.js';
import { esc } from '../utils/escape.js';

let armedReset = false;

export function renderTasksView() {
  const currentWeekKey = STATE.ui.wk || key(mon(new Date()));
  const weekList = (STATE.weeks[currentWeekKey] || [])
    .slice()
    .sort((a, b) => (b.hi ? 1 : 0) - (a.hi ? 1 : 0));

  const weekDays = [...Array(7)].map((_, i) => add(dt(currentWeekKey), i));
  const tdKey = today();

  const totalChecks = weekList.length * 7;
  const completedChecks = weekList.reduce(
    (acc, row) => acc + (row.c ? row.c.filter(Boolean).length : 0),
    0
  );
  const completionRatio = totalChecks ? completedChecks / totalChecks : 0;
  const prevWeekKey = key(add(dt(currentWeekKey), -7));
  const prevWeekTasks = STATE.weeks[prevWeekKey] || [];

  return `
    <section class="card">
      <div class="card-header">
        <div>
          <h2>${L(weekDays[0], { day: 'numeric', month: 'short' })} – ${L(weekDays[6], { day: 'numeric', month: 'short' })}</h2>
          ${currentWeekKey === key(mon(new Date())) ? '<span class="chip mint">This Week</span>' : ''}
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="rnd-btn" data-action="prev-week" aria-label="Previous week">‹</button>
          <button class="pill" data-action="this-week">This Week</button>
          <button class="rnd-btn" data-action="next-week" aria-label="Next week">›</button>
        </div>
      </div>

      <!-- Habit Progress Bar & Action Tools -->
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:18px">
        <div class="weekly-prog-bar">
          <i style="width:${completionRatio * 100}%"></i>
        </div>
        <b class="f" style="font-size:18px">${Math.round(completionRatio * 100)}%</b>

        <button
          class="pill ${armedReset ? 'active' : 'secondary'}"
          style="${armedReset ? 'background:var(--pink);color:#fff' : ''}"
          data-action="reset-weekly-ticks"
        >
          ${armedReset ? 'Tap again to untick all' : 'Reset ticks'}
        </button>

        ${!weekList.length && prevWeekTasks.length ? `
          <button class="pill" data-action="copy-prev-week">Copy last week's habits</button>
        ` : ''}
      </div>

      <!-- Add New Habit Row -->
      <div class="input-row">
        <input
          id="weekly-input"
          class="input-text"
          placeholder="New weekly habit or goal (e.g. Morning run, Read 20m)..."
          maxlength="120"
        />
        <button class="pill secondary" id="weekly-star-toggle" data-action="toggle-new-habit-star" data-starred="false">★ Star</button>
        <button class="btn-primary" data-action="add-weekly-habit">Add Habit</button>
      </div>

      <!-- Weekly Matrix Grid -->
      <div class="weekly-container">
        <div class="weekly-grid">
          <div></div>
          ${weekDays.map((d) => `
            <div class="weekly-header-day ${key(d) === tdKey ? 'today' : ''}">
              ${L(d, { weekday: 'short' })}
              <b>${d.getDate()}</b>
            </div>
          `).join('')}

          ${weekList.map((row) => `
            <div class="weekly-task-cell ${row.hi ? 'high-priority' : ''}">
              <button class="weekly-star-btn" data-action="toggle-habit-star" data-id="${row.id}">
                ${row.hi ? '★' : '☆'}
              </button>
              <span style="flex:1;min-width:0;overflow-wrap:anywhere;font-size:15px;font-weight:${row.hi ? '700' : '500'}">
                ${esc(row.t)}
              </span>
              <button class="task-del-btn" data-action="delete-weekly-habit" data-id="${row.id}">×</button>
            </div>
            ${weekDays.map((d, dayIdx) => `
              <div class="weekly-check-cell ${key(d) === tdKey ? 'today' : ''}">
                <button
                  class="weekly-box-btn ${(row.c && row.c[dayIdx]) ? 'done' : ''} ${STATE.ui.popId === row.id + dayIdx ? 'pop' : ''}"
                  data-action="toggle-habit-tick"
                  data-id="${row.id}"
                  data-day="${dayIdx}"
                  aria-label="${L(d, { weekday: 'long' })}"
                >
                  ${(row.c && row.c[dayIdx]) ? '✓' : ''}
                </button>
              </div>
            `).join('')}
          `).join('')}
        </div>
      </div>

      ${weekList.length
        ? '<p style="color:var(--mute);font-size:13px;margin:12px 0 0">★ Starred habits stay pinned at the top. Tap any box to check off!</p>'
        : '<p style="color:var(--mute);font-size:14px;text-align:center;padding:24px 0">No habits added for this week yet. Add your first above!</p>'}
    </section>
  `;
}
