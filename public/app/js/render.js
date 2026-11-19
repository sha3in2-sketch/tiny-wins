/* ==========================================================================
   TINYWINS OS — MASTER RENDERER
   ========================================================================== */

import { attachQrCode, renderModalRoot } from "./components/modal.js";
import { renderSyncBadge } from "./components/sync-badge.js";
import { STATE } from "./store.js";
import { renderCalendarView } from "./views/calendar.js";
import { renderJournalView } from "./views/journal.js";
import { renderProjectsView } from "./views/projects.js";
import { renderSettingsView } from "./views/settings.js";
import { renderTasksView } from "./views/tasks.js";
import { renderTodayView } from "./views/today.js";

export function renderApp() {
	const root = document.getElementById("app-root");
	if (!root) return;

	const currentTab = STATE.ui.tab || "today";

	// Choose which view to render
	let viewHtml = "";
	switch (currentTab) {
		case "today":
			viewHtml = renderTodayView();
			break;
		case "calendar":
			viewHtml = renderCalendarView();
			break;
		case "tasks":
			viewHtml = renderTasksView();
			break;
		case "journal":
			viewHtml = renderJournalView();
			break;
		case "projects":
			viewHtml = renderProjectsView();
			break;
		case "settings":
			viewHtml = renderSettingsView();
			break;
		default:
			viewHtml = renderTodayView();
	}

	root.innerHTML = `
    <div class="main-content">
      <!-- App Header -->
      <header class="app-header">
        <a href="#today" class="brand">
          <i class="brand-icon">✨</i>
          <span class="f">Tiny Wins</span>
        </a>

        <!-- Desktop Navigation Tabs -->
        <nav class="view-tabs" role="tablist">
          <a href="#today" class="view-tab ${currentTab === "today" ? "active" : ""}">☀️ Today</a>
          <a href="#calendar" class="view-tab ${currentTab === "calendar" ? "active" : ""}">🗓️ Calendar</a>
          <a href="#tasks" class="view-tab ${currentTab === "tasks" ? "active" : ""}">✅ Habits</a>
          <a href="#journal" class="view-tab ${currentTab === "journal" ? "active" : ""}">📝 Journal</a>
          <a href="#projects" class="view-tab ${currentTab === "projects" ? "active" : ""}">📁 Projects</a>
          <a href="#settings" class="view-tab ${currentTab === "settings" ? "active" : ""}">⚙️ Settings</a>
        </nav>

        <!-- Right Header Action Tools -->
        <div class="header-tools">
          ${renderSyncBadge()}
          <button class="pill" data-action="open-pairing-modal" title="Connect your phone">📱 Phone</button>
        </div>
      </header>

      <!-- Active View Content -->
      <main id="view-container">
        ${viewHtml}
      </main>
    </div>

    <!-- Mobile Bottom Navigation Bar -->
    <nav class="bottom-nav">
      <div class="bottom-nav-inner">
        <a href="#today" class="nav-item ${currentTab === "today" ? "active" : ""}">
          <i>☀️</i>
          <span>Today</span>
        </a>
        <a href="#calendar" class="nav-item ${currentTab === "calendar" ? "active" : ""}">
          <i>🗓️</i>
          <span>Calendar</span>
        </a>
        <a href="#tasks" class="nav-item ${currentTab === "tasks" ? "active" : ""}">
          <i>✅</i>
          <span>Habits</span>
        </a>
        <a href="#journal" class="nav-item ${currentTab === "journal" ? "active" : ""}">
          <i>📝</i>
          <span>Journal</span>
        </a>
        <a href="#projects" class="nav-item ${currentTab === "projects" ? "active" : ""}">
          <i>📁</i>
          <span>Projects</span>
        </a>
        <a href="#settings" class="nav-item ${currentTab === "settings" ? "active" : ""}">
          <i>⚙️</i>
          <span>Settings</span>
        </a>
      </div>
    </nav>

    <!-- Modal Container -->
    <div id="modal-layer">
      ${renderModalRoot()}
    </div>
  `;

	// Draw QR code if modal open
	if (STATE.ui.showModal === "pairing") {
		setTimeout(attachQrCode, 50);
	}

	STATE.ui.popId = null;
}
