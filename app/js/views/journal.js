/* ==========================================================================
   TINYWINS OS — JOURNAL & NOTES VIEW
   ========================================================================== */
import { STATE } from "../store.js";
import { dt, L, rel, today } from "../utils/date.js";
import { esc } from "../utils/escape.js";

export function renderJournalView() {
	const activeDate = STATE.ui.sel || today();
	const entry = STATE.notes[activeDate] || { body: "", mood: 3, energy: 3 };

	const moods = [
		{ score: 1, emoji: "😴", label: "Tired" },
		{ score: 2, emoji: "😐", label: "Okay" },
		{ score: 3, emoji: "🙂", label: "Good" },
		{ score: 4, emoji: "😊", label: "Great" },
		{ score: 5, emoji: "🤩", label: "Fire" },
	];

	const relativeLabel = rel(activeDate);

	// Collect past reflections from STATE.notes
	const savedDates = Object.keys(STATE.notes || {})
		.filter((d) => {
			const n = STATE.notes[d];
			return n && (Boolean(n.body?.trim()) || n.mood || n.energy);
		})
		.sort((a, b) => (a < b ? 1 : -1));

	return `
    <section class="card journal-container">
      <div class="card-header journal-header-wrap">
        <div>
          <h2>Daily Journal & Thoughts</h2>
          <div class="journal-date-controls">
            <button class="btn icon-btn" data-action="journal-prev-day" title="Previous Day">‹</button>
            <span class="chip mint journal-date-chip">
              ${L(dt(activeDate), { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              ${relativeLabel ? `<span class="journal-rel-tag">${relativeLabel}</span>` : ""}
            </span>
            <button class="btn icon-btn" data-action="journal-next-day" title="Next Day">›</button>
            <button class="btn sub journal-today-btn" data-action="journal-go-today">Today</button>
            <label class="journal-picker-wrapper" title="Jump to any date">
              📅 <input type="date" value="${activeDate}" data-action="journal-pick-date" class="journal-date-input" />
            </label>
          </div>
        </div>
        <span class="journal-saved-hint" id="journal-saved-indicator">✓ Auto-saved locally</span>
      </div>

      <!-- Mood & Energy Selector -->
      <div class="journal-meta-row">
        <div>
          <span class="journal-label">HOW WAS YOUR MOOD?</span>
          <div class="journal-mood-row">
            ${moods
							.map(
								(m) => `
              <button
                class="mood-btn ${entry.mood === m.score ? "selected" : ""}"
                data-action="set-mood"
                data-score="${m.score}"
                data-date="${activeDate}"
                title="${m.label}"
              >
                ${m.emoji}
              </button>
            `,
							)
							.join("")}
          </div>
        </div>

        <div>
          <span class="journal-label">ENERGY LEVEL (1–5)</span>
          <div class="energy-slider-group">
            <span>⚡</span>
            <input
              type="range"
              min="1"
              max="5"
              value="${entry.energy || 3}"
              id="journal-energy-slider"
              data-action="set-energy"
              data-date="${activeDate}"
            />
            <b id="journal-energy-label">${entry.energy || 3}/5</b>
          </div>
        </div>
      </div>

      <!-- Journal Freetext Area -->
      <textarea
        id="journal-input"
        class="journal-textarea"
        placeholder="What did you learn today? What went well? Write freely without pressure..."
        data-date="${activeDate}"
      >${esc(entry.body || "")}</textarea>
    </section>

    <!-- Past Reflections Archive -->
    <section class="card journal-archive-card" style="margin-top: 20px;">
      <div class="card-header">
        <div>
          <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: var(--ink);">📖 Recorded Thoughts & Timeline</h3>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: var(--mute);">Browse or revisit thoughts and mood logs from any previous date</p>
        </div>
        <span class="chip purple">${savedDates.length} ${savedDates.length === 1 ? "day recorded" : "days recorded"}</span>
      </div>

      ${
				savedDates.length > 0
					? `
        <div class="journal-history-grid">
          ${savedDates
						.map((d) => {
							const n = STATE.notes[d] || {};
							const moodObj = moods.find((m) => m.score === n.mood) || moods[2];
							const isSelected = d === activeDate;
							const rLabel = rel(d);
							const snippet = n.body?.trim()
								? n.body.length > 90
									? `${n.body.slice(0, 90)}...`
									: n.body
								: "(Mood and energy logged without notes)";

							return `
              <div
                class="journal-history-card ${isSelected ? "active-date" : ""}"
                data-action="journal-select-date"
                data-date="${d}"
                role="button"
                tabindex="0"
                title="Click to view notes for ${d}"
              >
                <div class="journal-card-top">
                  <div class="journal-card-date">
                    <b>${L(dt(d), { weekday: "short", day: "numeric", month: "short" })}</b>
                    ${rLabel ? `<span class="chip mint mini">${rLabel}</span>` : ""}
                  </div>
                  <div class="journal-card-stats">
                    <span class="journal-card-mood" title="${moodObj.label}">${moodObj.emoji}</span>
                    <span class="journal-card-energy">⚡${n.energy || 3}/5</span>
                  </div>
                </div>
                <div class="journal-card-snippet">${esc(snippet)}</div>
              </div>
            `;
						})
						.join("")}
        </div>
      `
					: `
        <div class="journal-empty-history">
          <span style="font-size: 32px; display: block; margin-bottom: 8px;">✍️</span>
          <p style="margin: 0; font-weight: 600; color: var(--ink);">No saved reflections yet</p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: var(--mute);">Your daily thoughts, mood ratings, and energy levels will automatically be archived here by date as you write!</p>
        </div>
      `
			}
    </section>
  `;
}
