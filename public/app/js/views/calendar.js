/* ==========================================================================
   TINYWINS OS — CALENDAR VIEW (MONTH, WEEK TIME-GRID & DAY PLANNER)
   ========================================================================== */
import { STATE, tasks } from "../store.js";
import {
	add,
	dt,
	getMonthMatrix,
	key,
	L,
	mon,
	monthTitle,
	pad,
	today,
} from "../utils/date.js";
import { esc } from "../utils/escape.js";

// Configuration for Hourly Time Grid
export const START_HOUR = 7; // 7 AM
export const END_HOUR = 23; // 11 PM
export const HOUR_HEIGHT = 64; // pixels per 1-hour row

// Helper to format hour into 12-hour AM/PM label
export function formatHour(h) {
	const period = h >= 12 ? "PM" : "AM";
	const displayH = h % 12 === 0 ? 12 : h % 12;
	return `${displayH}${period}`;
}

// Helper to parse time string "12:15" or "12:15 PM" to hour and minute numbers
export function parseTimeString(timeStr) {
	if (!timeStr) return null;
	const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
	if (!match) return null;
	let hour = Number.parseInt(match[1], 10);
	const min = Number.parseInt(match[2], 10);
	const modifier = match[3] ? match[3].toLowerCase() : null;

	if (modifier === "pm" && hour < 12) hour += 12;
	if (modifier === "am" && hour === 12) hour = 0;

	return { hour, min };
}

// Format 24h hour and minute to standard readable "12:15 PM"
export function formatTimeLabel(hour, min) {
	const period = hour >= 12 ? "PM" : "AM";
	const displayH = hour % 12 === 0 ? 12 : hour % 12;
	return `${displayH}:${pad(min)} ${period}`;
}

// Interval Partitioning Algorithm (Sweep-Line Greedy Coloring for collision-free parallel slots)
export function layoutOverlappingEvents(
	events,
	pixelsPerHour = HOUR_HEIGHT,
	startHour = START_HOUR,
	endHour = END_HOUR,
) {
	const valid = [];
	for (const task of events) {
		if (!task.time) continue;
		const parsed = parseTimeString(task.time);
		if (!parsed) continue;
		if (parsed.hour < startHour || parsed.hour > endHour) continue;

		const startMin = parsed.hour * 60 + parsed.min;
		const durationMin = Math.max(task.duration || 30, 15);
		const endMin = startMin + durationMin;

		valid.push({
			task,
			startMin,
			endMin,
			durationMin,
		});
	}

	if (valid.length === 0) return [];

	// 1. Sort by startMin asc, then durationMin desc
	valid.sort((a, b) => {
		if (a.startMin !== b.startMin) return a.startMin - b.startMin;
		return b.durationMin - a.durationMin;
	});

	// 2. Greedy column placement
	const columns = [];
	const visualEvents = [];

	for (const ev of valid) {
		let placedCol = -1;
		for (let c = 0; c < columns.length; c++) {
			if (columns[c] <= ev.startMin) {
				placedCol = c;
				columns[c] = ev.endMin;
				break;
			}
		}

		if (placedCol === -1) {
			columns.push(ev.endMin);
			placedCol = columns.length - 1;
		}

		const minutesFromStart = ev.startMin - startHour * 60;
		const top = (minutesFromStart / 60) * pixelsPerHour;
		const height = Math.max((ev.durationMin / 60) * pixelsPerHour - 3, 24);

		visualEvents.push({
			task: ev.task,
			column: placedCol,
			totalColumns: 1,
			top,
			height,
			startMin: ev.startMin,
			endMin: ev.endMin,
		});
	}

	// 3. Cluster normalization pass
	for (let i = 0; i < visualEvents.length; i++) {
		const cur = visualEvents[i];
		const cluster = visualEvents.filter((other) => {
			return (
				Math.max(cur.startMin, other.startMin) <
				Math.min(cur.endMin, other.endMin)
			);
		});

		const maxCol = Math.max(...cluster.map((e) => e.column)) + 1;
		for (const e of cluster) {
			e.totalColumns = Math.max(e.totalColumns, maxCol);
		}
	}

	return visualEvents;
}

// Notion Calendar-style Unscheduled Sidecar Drawer
export function renderSidecarTray() {
	if (!STATE.ui.sidecarOpen) return "";
	const items = STATE.inbox || [];

	return `
    <aside class="calendar-sidecar" id="calendar-sidecar">
      <div class="sidecar-header">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:16px">📥</span>
          <b style="font-size:13px;color:var(--ink)">Unscheduled Tray</b>
          <span class="chip" style="font-size:11px;padding:2px 7px">${items.length}</span>
        </div>
        <button class="sidecar-close-btn" data-action="toggle-sidecar" title="Close Tray (Shortcut: B)">×</button>
      </div>

      <div class="sidecar-input-wrap">
        <input id="sidecar-input" class="input-text" placeholder="Add backlog task... (Enter)" maxlength="120" />
        <button class="btn-primary" data-action="add-inbox-item" style="padding:6px 12px;font-size:12px;border-radius:10px">+ Add</button>
      </div>

      <div class="sidecar-list">
        ${
					items.length
						? items
								.map((item) => {
									const isGmail = item.source?.type === "gmail";
									const isGcal = item.source?.type === "google_calendar";
									const sourceBadge = isGmail
										? '<span class="source-chip gmail">📧 Gmail</span>'
										: isGcal
											? '<span class="source-chip gcal">🗓️ GCal</span>'
											: '<span class="source-chip manual">✨ Task</span>';

									return `
            <div class="sidecar-card ${item.priority === "high" ? "high-priority" : ""}">
              <div class="sidecar-card-top">
                ${sourceBadge}
                <span class="sidecar-est-pill">${item.estimatedMinutes || 30}m</span>
              </div>
              <div class="sidecar-card-title">${esc(item.t)}</div>
              ${item.source?.senderEmail ? `<div class="sidecar-card-meta">From: ${esc(item.source.senderEmail)}</div>` : ""}
              <div class="sidecar-card-footer">
                <button
                  class="pill primary sidecar-schedule-btn"
                  data-action="schedule-inbox-item"
                  data-id="${item.id}"
                  title="1-click schedule into next free slot"
                >
                  ⚡ Time Block
                </button>
                <button
                  class="sidecar-del-btn"
                  data-action="delete-inbox-item"
                  data-id="${item.id}"
                  title="Delete from backlog"
                >
                  ×
                </button>
              </div>
            </div>
          `;
								})
								.join("")
						: '<div class="sidecar-empty">All backlog items scheduled! Add new commitments above or connect Gmail.</div>'
				}
      </div>
    </aside>
  `;
}

export function renderCalendarView() {
	const currentYear = STATE.ui.calYear;
	const currentMonth = STATE.ui.calMonth;
	const viewMode = STATE.ui.calView || "timegrid"; // 'timegrid' (default week) | 'daygrid' | 'month'
	const displayDate = new Date(currentYear, currentMonth, 1);
	const todayKey = today();

	let mainContentHtml = "";

	// 1. MONTH VIEW MODE
	if (viewMode === "month") {
		const daysHeader = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
		const matrix = getMonthMatrix(currentYear, currentMonth);

		mainContentHtml = `
      <div class="cal-header-row">
        ${daysHeader.map((d) => `<div>${d}</div>`).join("")}
      </div>
      <div class="cal-grid">
        ${matrix
					.map((cell) => {
						const dayTasks = tasks(cell.key);
						const doneTasks = dayTasks.filter((t) => t.d).length;
						const totalTasks = dayTasks.length;
						const isToday = cell.isToday;
						const isOther = !cell.isCurrentMonth;
						const isSelected = STATE.ui.detailDate === cell.key;

						return `
            <div
              class="cal-day-cell ${isToday ? "today" : ""} ${isOther ? "other-month" : ""} ${isSelected ? "selected" : ""}"
              data-action="open-day-detail"
              data-date="${cell.key}"
            >
              <div class="cal-day-top">
                <span class="cal-day-num">${cell.dayNum}</span>
                ${totalTasks > 0 ? `<span class="cal-badge-count">${doneTasks}/${totalTasks}</span>` : ""}
              </div>

              <!-- Indicators: Dots on mobile -->
              <div class="cal-indicators">
                ${dayTasks
									.slice(0, 4)
									.map(
										(t) => `
                  <span class="cal-dot ${t.d ? "done" : t.time ? "timed" : t.priority === "high" ? "high" : ""}"></span>
                `,
									)
									.join("")}
              </div>

              <!-- Desktop preview pills (clickable to toggle/cross!) -->
              <div class="cal-preview-list">
                ${dayTasks
									.slice(0, 3)
									.map(
										(t) => `
                  <button
                    class="cal-preview-pill ${t.d ? "done" : ""}"
                    data-action="toggle-task-done"
                    data-id="${t.id}"
                    data-date="${cell.key}"
                    title="Click to cross out: ${esc(t.t)}"
                  >
                    ${t.d ? "✓ " : ""}${t.time ? `<b>${t.time}</b> ` : ""}${esc(t.t)}
                  </button>
                `,
									)
									.join("")}
                ${totalTasks > 3 ? `<span style="font-size:10px;color:var(--mute);font-weight:700">+${totalTasks - 3} more</span>` : ""}
              </div>
            </div>
          `;
					})
					.join("")}
      </div>
    `;
	}
	// 2. WEEK HOURLY TIME-GRID VIEW (NOTION / GCAL STYLE)
	else if (viewMode === "timegrid") {
		const selectedDate = dt(STATE.ui.sel || todayKey);
		const weekStart = mon(selectedDate);
		const weekDays = [...Array(7)].map((_, i) => add(weekStart, i));

		const totalHours = END_HOUR - START_HOUR + 1;
		const hours = [...Array(totalHours)].map((_, i) => START_HOUR + i);

		// Calculate current live time position for red indicator
		const now = new Date();
		const currentHour = now.getHours();
		const currentMin = now.getMinutes();
		const isNowInRange = currentHour >= START_HOUR && currentHour <= END_HOUR;
		const currentTopPx = isNowInRange
			? (currentHour - START_HOUR) * HOUR_HEIGHT +
				(currentMin / 60) * HOUR_HEIGHT
			: -1;

		mainContentHtml = `
      <div class="time-grid-wrapper">
        <!-- Sticky Weekday Header -->
        <div class="time-grid-header">
          <div class="time-grid-header-cell" style="font-size:11px;line-height:36px;color:var(--mute)">GMT</div>
          ${weekDays
						.map((d) => {
							const dKey = key(d);
							const isTd = dKey === todayKey;
							return `
              <div class="time-grid-header-cell ${isTd ? "today" : ""}">
                <span>${L(d, { weekday: "short" })}</span>
                <b>${d.getDate()}</b>
              </div>
            `;
						})
						.join("")}
        </div>

        <!-- Scrollable Hourly Time Canvas -->
        <div class="time-grid-scroll" id="time-grid-scroll">
          <div class="time-grid-canvas">
            <!-- Time Axis Column -->
            <div class="time-gutter">
              ${hours
								.map(
									(h) => `
                <div class="time-gutter-hour">
                  <span>${formatHour(h)}</span>
                </div>
              `,
								)
								.join("")}
            </div>

            <!-- 7 Day Columns -->
            ${weekDays
							.map((d) => {
								const dKey = key(d);
								const isTd = dKey === todayKey;
								const dayTasks = tasks(dKey);

								return `
                <div class="time-day-col ${isTd ? "today" : ""}" data-date="${dKey}">
                  <!-- Red Current Time Indicator -->
                  ${
										isTd && currentTopPx >= 0
											? `
                    <div class="current-time-line" style="top:${currentTopPx}px" title="Current Time"></div>
                  `
											: ""
									}

                  <!-- 1-Hour Interactive Slots -->
                  ${hours
										.map(
											(h) => `
                    <div
                      class="time-slot-hour"
                      data-action="slot-click"
                      data-date="${dKey}"
                      data-hour="${h}"
                      title="Click anywhere to add task at this time"
                    ></div>
                  `,
										)
										.join("")}

                  <!-- Parallel Collision-Free Time-Blocks (Sweep-Line Greedy Interval Partitioning) -->
                  ${layoutOverlappingEvents(
										dayTasks,
										HOUR_HEIGHT,
										START_HOUR,
										END_HOUR,
									)
										.map((ve) => {
											const t = ve.task;
											const colorClass =
												t.source?.type === "gmail"
													? "color-teal"
													: t.type === "meeting" ||
															t.source?.type === "google_calendar"
														? "color-purple"
														: t.priority === "high"
															? "color-pink"
															: t.priority === "med"
																? "color-sun"
																: "color-blue";

											const leftStyle = `calc(3px + (100% - 6px) * ${ve.column} / ${ve.totalColumns})`;
											const widthStyle = `calc((100% - 6px) / ${ve.totalColumns} - 2px)`;
											const sourceIcon =
												t.source?.type === "gmail"
													? "📧 "
													: t.source?.type === "google_calendar"
														? "🗓️ "
														: "";

											return `
                      <div
                        class="time-block ${colorClass} ${t.d ? "done" : ""}"
                        style="top:${ve.top}px;height:${ve.height}px;left:${leftStyle};width:${widthStyle};"
                        data-action="toggle-task-done"
                        data-id="${t.id}"
                        data-date="${dKey}"
                        title="${t.d ? "Completed! Click to uncross" : `Click to cross out: ${esc(t.t)}`}"
                      >
                        <div class="time-block-content">
                          <button
                            class="time-block-check ${t.d ? "checked" : ""}"
                            data-action="toggle-task-done"
                            data-id="${t.id}"
                            data-date="${dKey}"
                            title="${t.d ? "Completed" : "Mark done"}"
                          >
                            ${t.d ? "✓" : ""}
                          </button>
                          <span
                            class="time-block-title"
                            data-action="toggle-task-done"
                            data-id="${t.id}"
                            data-date="${dKey}"
                            title="Click to cross out: ${esc(t.t)}"
                          >${sourceIcon}${esc(t.t)}</span>
                          <span class="time-block-time">${t.time}</span>
                        </div>
                        <div class="time-block-actions">
                          <button
                            class="time-block-edit"
                            data-action="open-edit-task"
                            data-id="${t.id}"
                            data-date="${dKey}"
                            title="Edit"
                          >✏️</button>
                          <button
                            class="time-block-del"
                            data-action="delete-task"
                            data-id="${t.id}"
                            data-date="${dKey}"
                            title="Delete"
                          >×</button>
                        </div>
                      </div>
                    `;
										})
										.join("")}
                </div>
              `;
							})
							.join("")}
          </div>
        </div>
      </div>
    `;
	}
	// 3. DAY FOCUSED TIME-GRID
	else {
		const activeDateKey = STATE.ui.sel || todayKey;
		const activeDate = dt(activeDateKey);
		const dayTasks = tasks(activeDateKey);
		const totalHours = END_HOUR - START_HOUR + 1;
		const hours = [...Array(totalHours)].map((_, i) => START_HOUR + i);

		const now = new Date();
		const currentHour = now.getHours();
		const currentMin = now.getMinutes();
		const isNowInRange = currentHour >= START_HOUR && currentHour <= END_HOUR;
		const currentTopPx =
			activeDateKey === todayKey && isNowInRange
				? (currentHour - START_HOUR) * HOUR_HEIGHT +
					(currentMin / 60) * HOUR_HEIGHT
				: -1;

		mainContentHtml = `
      <div class="time-grid-wrapper">
        <div class="time-grid-header day-mode">
          <div class="time-grid-header-cell" style="font-size:11px;line-height:36px;color:var(--mute)">GMT</div>
          <div class="time-grid-header-cell today">
            <span>${L(activeDate, { weekday: "long" })}</span>
            <b>${L(activeDate, { day: "numeric", month: "long", year: "numeric" })}</b>
          </div>
        </div>

        <div class="time-grid-scroll" id="time-grid-scroll">
          <div class="time-grid-canvas day-mode">
            <div class="time-gutter">
              ${hours
								.map(
									(h) => `
                <div class="time-gutter-hour">
                  <span>${formatHour(h)}</span>
                </div>
              `,
								)
								.join("")}
            </div>

            <div class="time-day-col today" data-date="${activeDateKey}">
              ${
								currentTopPx >= 0
									? `
                <div class="current-time-line" style="top:${currentTopPx}px"></div>
              `
									: ""
							}

              ${hours
								.map(
									(h) => `
                <div
                  class="time-slot-hour"
                  data-action="slot-click"
                  data-date="${activeDateKey}"
                  data-hour="${h}"
                  title="Click to schedule at this hour"
                ></div>
              `,
								)
								.join("")}

              <!-- Parallel Collision-Free Day Time-Blocks -->
              ${layoutOverlappingEvents(
								dayTasks,
								HOUR_HEIGHT,
								START_HOUR,
								END_HOUR,
							)
								.map((ve) => {
									const t = ve.task;
									const colorClass =
										t.source?.type === "gmail"
											? "color-teal"
											: t.type === "meeting" ||
													t.source?.type === "google_calendar"
												? "color-purple"
												: t.priority === "high"
													? "color-pink"
													: t.priority === "med"
														? "color-sun"
														: "color-blue";

									const leftStyle = `calc(3px + (100% - 6px) * ${ve.column} / ${ve.totalColumns})`;
									const widthStyle = `calc((100% - 6px) / ${ve.totalColumns} - 2px)`;
									const sourceIcon =
										t.source?.type === "gmail"
											? "📧 "
											: t.source?.type === "google_calendar"
												? "🗓️ "
												: "";

									return `
                  <div
                    class="time-block ${colorClass} ${t.d ? "done" : ""}"
                    style="top:${ve.top}px;height:${ve.height}px;left:${leftStyle};width:${widthStyle};"
                    data-action="toggle-task-done"
                    data-id="${t.id}"
                    data-date="${activeDateKey}"
                    title="${t.d ? "Completed! Click to uncross" : `Click to cross out: ${esc(t.t)}`}"
                  >
                    <div class="time-block-content">
                      <button
                        class="time-block-check ${t.d ? "checked" : ""}"
                        data-action="toggle-task-done"
                        data-id="${t.id}"
                        data-date="${activeDateKey}"
                      >
                        ${t.d ? "✓" : ""}
                      </button>
                      <span
                        class="time-block-title"
                        style="font-size:13px"
                        data-action="toggle-task-done"
                        data-id="${t.id}"
                        data-date="${activeDateKey}"
                        title="Click to cross out: ${esc(t.t)}"
                      >${sourceIcon}${esc(t.t)}</span>
                      <span class="time-block-time" style="font-size:11px">${t.time}</span>
                    </div>
                    <div class="time-block-actions">
                      <button
                        class="time-block-edit"
                        data-action="open-edit-task"
                        data-id="${t.id}"
                        data-date="${activeDateKey}"
                        title="Edit"
                      >✏️</button>
                      <button
                        class="time-block-del"
                        data-action="delete-task"
                        data-id="${t.id}"
                        data-date="${activeDateKey}"
                      >×</button>
                    </div>
                  </div>
                `;
								})
								.join("")}
            </div>
          </div>
        </div>
      </div>
    `;
	}

	// Header Title
	const navTitle =
		viewMode === "timegrid"
			? `Week of ${L(mon(dt(STATE.ui.sel || todayKey)), { day: "numeric", month: "short" })}`
			: viewMode === "daygrid"
				? L(dt(STATE.ui.sel || todayKey), {
						weekday: "short",
						day: "numeric",
						month: "short",
					})
				: monthTitle(displayDate);

	return `
    <section class="card" style="padding:18px">
      <!-- Calendar Top Bar -->
      <div class="calendar-view-controls">
        <div class="cal-nav-group">
          <h2 class="cal-title">${navTitle}</h2>
          <button class="rnd-btn" data-action="cal-prev" aria-label="Previous">‹</button>
          <button class="pill" data-action="cal-today">Today</button>
          <button class="rnd-btn" data-action="cal-next" aria-label="Next">›</button>
        </div>

        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <div class="cal-mode-pills">
            <button
              class="cal-mode-btn ${viewMode === "timegrid" ? "active" : ""}"
              data-action="set-cal-mode"
              data-mode="timegrid"
              title="Notion / Google Calendar Week Time Grid (W)"
            >
              ⏱️ Week
            </button>
            <button
              class="cal-mode-btn ${viewMode === "daygrid" ? "active" : ""}"
              data-action="set-cal-mode"
              data-mode="daygrid"
              title="Single Day Planner (D)"
            >
              📅 Day
            </button>
            <button
              class="cal-mode-btn ${viewMode === "month" ? "active" : ""}"
              data-action="set-cal-mode"
              data-mode="month"
              title="Full Month Calendar (M)"
            >
              🗓️ Month
            </button>
          </div>

          <!-- Unscheduled Tray Toggle (Notion Calendar style) -->
          <button
            class="pill ${STATE.ui.sidecarOpen ? "active" : "secondary"}"
            data-action="toggle-sidecar"
            title="Unscheduled Backlog Tray (B)"
          >
            📥 Backlog <span class="badge-mini" style="background:${STATE.ui.sidecarOpen ? "#fff" : "var(--pl)"};color:${STATE.ui.sidecarOpen ? "var(--p)" : "var(--p)"};border-radius:6px;padding:1px 6px;font-size:11px;font-weight:700">${(STATE.inbox || []).length}</span>
          </button>

          <!-- Command Palette Trigger -->
          <button
            class="pill secondary"
            data-action="open-command-palette"
            title="Command Palette (⌘K / Ctrl+K)"
          >
            ⚡ ⌘K
          </button>

          <!-- Daily Wins Retrospective -->
          <button
            class="pill secondary"
            data-action="open-retrospective"
            title="Daily Wins Retrospective (R)"
          >
            🏆 Wins
          </button>
        </div>
      </div>

      <!-- Main Rendered View Mode with Notion-Style Sidecar Tray -->
      <div class="calendar-workspace ${STATE.ui.sidecarOpen ? "with-sidecar" : ""}">
        <div class="calendar-main-pane">
          ${mainContentHtml}
        </div>
        ${renderSidecarTray()}
      </div>
    </section>
  `;
}
