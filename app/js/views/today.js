/* ==========================================================================
   TINYWINS OS — TODAY / HOME VIEW
   ========================================================================== */
import { pct, STATE, streak, tasks } from "../store.js";
import { add, dt, key, L, rel, today } from "../utils/date.js";
import { esc } from "../utils/escape.js";

export function renderTodayView() {
	const selDate = STATE.ui.sel || today();
	const tList = tasks(selDate);
	const doneCount = tList.filter((x) => x.d).length;
	const totalCount = tList.length;
	const progressRatio = totalCount ? doneCount / totalCount : 0;
	const circumference = 2 * Math.PI * 52;
	const currentStreak = streak();

	// 14-day history calculation
	const hist = [...Array(14)].map((_, i) => key(add(new Date(), i - 12)));
	const completedHistory = hist.filter((k) => pct(k) !== null);
	const averagePct = completedHistory.length
		? Math.round(
				(completedHistory.reduce((acc, k) => acc + pct(k), 0) /
					completedHistory.length) *
					100,
			)
		: 0;

	const motivationalMsg = !totalCount
		? "Nothing planned yet. What would make today a win?"
		: progressRatio === 1
			? "All done! Amazing focus today. Enjoy your evening! 🎉"
			: `${totalCount - doneCount} to go, you’ve got this!`;

	return `
    <!-- Top Summary Card with Animated Progress Ring -->
    <section class="card">
      <div class="card-header">
        <div>
          <h2>${L(dt(selDate), { weekday: "long", day: "numeric", month: "long" })}</h2>
          <span class="chip ${rel(selDate) === "Today" ? "sun" : "mint"}">${rel(selDate) || "Selected Day"}</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="rnd-btn" data-action="prev-day" aria-label="Previous day">‹</button>
          <button class="pill ${selDate === today() ? "active" : ""}" data-action="go-today">Today</button>
          <button class="pill ${selDate === key(add(new Date(), 1)) ? "active" : ""}" data-action="go-tomorrow">Tomorrow</button>
          <button class="rnd-btn" data-action="next-day" aria-label="Next day">›</button>
        </div>
      </div>

      <div class="sum-box">
        <div class="ring-wrap">
          <svg viewBox="0 0 130 130" width="130" height="130">
            <circle cx="65" cy="65" r="52" stroke="#ece9ff" />
            <circle
              cx="65" cy="65" r="52"
              stroke="${progressRatio === 1 ? "var(--mint)" : "var(--p)"}"
              stroke-dasharray="${circumference * progressRatio} ${circumference}"
              transform="rotate(-90 65 65)"
              style="transition:stroke-dasharray .5s ease"
            />
          </svg>
          <b>${Math.round(progressRatio * 100)}%</b>
        </div>
        <div>
          <p class="motivational-msg">${motivationalMsg}</p>
          <div class="stats-grid">
            <div class="stat-card">
              <b>${doneCount}/${totalCount}</b>
              <span>done</span>
            </div>
            <div class="stat-card streak">
              <b>${currentStreak} 🔥</b>
              <span>day streak</span>
            </div>
            <div class="stat-card avg">
              <b>${averagePct}%</b>
              <span>14-day avg</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Daily Task List with Priority & Time Inputs -->
    <section class="card">
      <div class="input-row">
        <input
          id="today-task-input"
          class="input-text"
          maxlength="120"
          placeholder="What's on for ${rel(selDate).toLowerCase() || "this day"}?"
          aria-label="New task"
        />
        <button class="pill secondary" id="today-priority-btn" data-action="cycle-priority" data-priority="normal">★ Normal</button>
        <button class="btn-primary" data-action="add-today-task">Add</button>
      </div>

      <div id="tasks-container">
        ${
					tList.length
						? tList
								.map(
									(t) => `
            <div class="task-row ${t.d ? "done" : ""} ${t.priority === "high" ? "priority-high" : t.priority === "med" ? "priority-med" : ""}">
              <button
                class="task-check ${t.d ? "done" : ""} ${STATE.ui.popId === t.id ? "pop" : ""}"
                data-action="toggle-task-done"
                data-id="${t.id}"
                data-date="${selDate}"
                aria-label="Mark done"
              >
                ${t.d ? "✓" : ""}
              </button>
              <div class="task-text" data-action="open-edit-task" data-id="${t.id}" data-date="${selDate}">
                ${t.time ? `<span class="task-time-chip">${t.time}</span>` : ""}
                <span class="task-title-text">${esc(t.t)}</span>
              </div>
              <div class="task-actions">
                <button class="task-edit-btn" data-action="open-edit-task" data-id="${t.id}" data-date="${selDate}" title="Edit task">✏️</button>
                <button class="task-del-btn" data-action="delete-task" data-id="${t.id}" data-date="${selDate}" aria-label="Delete">×</button>
              </div>
            </div>
          `,
								)
								.join("")
						: '<p style="color:var(--mute);text-align:center;padding:24px 0;margin:0">Nothing planned yet. Type above to add a win!</p>'
				}
      </div>
    </section>

    <!-- 14-Day Completion History Bars -->
    <section class="card">
      <div class="card-header">
        <h3>14-Day Momentum</h3>
        <span style="font-size:13px;color:var(--mute);font-weight:600">Tap a bar to travel to that date</span>
      </div>
      <div class="history-bars">
        ${hist
					.map((k) => {
						const q = pct(k);
						const isSelected = k === selDate;
						return `
            <button class="history-bar ${isSelected ? "active" : ""}" data-action="select-day" data-key="${k}">
              <i style="height:${q ? Math.max(q * 100, 10) : 6}%;background:${q === 1 ? "var(--mint)" : q ? "var(--p)" : "var(--line)"}"></i>
              <small>${L(dt(k), { weekday: "narrow" })}</small>
            </button>
          `;
					})
					.join("")}
      </div>
    </section>
  `;
}
