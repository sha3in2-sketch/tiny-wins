/* ==========================================================================
   TINYWINS OS — PROJECTS & KANBAN VIEW
   ========================================================================== */
import { STATE } from '../store.js';
import { esc } from '../utils/escape.js';

export function renderProjectsView() {
  const projects = STATE.projects || [];

  return `
    <section class="card">
      <div class="projects-header">
        <div>
          <h2>Projects & Focus Areas</h2>
          <p style="color:var(--mute);font-size:14px;margin:4px 0 0">Group your big goals and break them into tiny actionable steps</p>
        </div>
        <button class="btn-primary" data-action="new-project-prompt">+ New Project</button>
      </div>

      <!-- Quick Kanban Columns demo / overview -->
      <div class="kanban-board">
        <div class="kanban-col">
          <div class="kanban-col-head">
            <span>📋 To Do</span>
            <span class="chip">Active</span>
          </div>
          <div class="kanban-cards">
            <div class="kanban-card">
              <b>Research Notion Calendar</b>
              <p style="font-size:13px;color:var(--mute);margin:4px 0 0">Examine time blocking & week layouts</p>
            </div>
            <div class="kanban-card">
              <b>Setup Gmail Integration</b>
              <p style="font-size:13px;color:var(--mute);margin:4px 0 0">Connect Google API for daily digest</p>
            </div>
          </div>
        </div>

        <div class="kanban-col">
          <div class="kanban-col-head">
            <span>⚡ In Progress</span>
            <span class="chip sun">Working</span>
          </div>
          <div class="kanban-cards">
            <div class="kanban-card">
              <b>Tiny Wins OS Phase 1</b>
              <p style="font-size:13px;color:var(--mute);margin:4px 0 0">Modular JS/CSS architecture & Calendar view</p>
            </div>
          </div>
        </div>

        <div class="kanban-col">
          <div class="kanban-col-head">
            <span>🎉 Done</span>
            <span class="chip mint">Finished</span>
          </div>
          <div class="kanban-cards">
            <div class="kanban-card" style="opacity:0.7">
              <s>24/7 Supabase Sync</s>
              <p style="font-size:13px;color:var(--mute);margin:4px 0 0">Realtime cloud backup & device revocation</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
