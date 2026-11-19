/* ==========================================================================
   TINYWINS OS — SETTINGS VIEW
   ========================================================================== */
import { getRoomId } from "../store.js";

export function renderSettingsView() {
	const currentRoomId = getRoomId();

	return `
    <section class="card">
      <div class="card-header">
        <h2>Settings & Preferences</h2>
      </div>

      <div style="display:flex;flex-direction:column;gap:18px">
        <!-- Cloud Sync & Room info -->
        <div style="background:var(--surface-raised);border:1.5px solid var(--line);border-radius:18px;padding:18px">
          <h3 style="font-size:18px;margin-bottom:6px">📱 24/7 Cloud Sync & Devices</h3>
          <p style="color:var(--mute);font-size:14px;margin:0 0 12px">
            Your current private room code is <b>${currentRoomId}</b>. Connect your phone or laptop by scanning the QR code.
          </p>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn-primary" data-action="open-pairing-modal">📲 Connect Phone (QR Code)</button>
            <button class="pill secondary" data-action="revoke-room-devices" style="color:var(--pink)">🔒 Revoke Other Devices</button>
          </div>
        </div>

        <!-- Google Calendar & Gmail integration -->
        <div style="background:var(--surface-raised);border:1.5px solid var(--line);border-radius:18px;padding:18px">
          <h3 style="font-size:18px;margin-bottom:6px">🔗 Google Calendar & Gmail (Phase 3 & 4)</h3>
          <p style="color:var(--mute);font-size:14px;margin:0 0 12px">
            Connect your Google account to bring events directly into Tiny Wins Calendar and get morning Gmail task digests.
          </p>
          <button class="pill" data-action="google-connect-prompt">🔑 Connect Google Account</button>
        </div>

        <!-- App version & diagnostics -->
        <div style="background:var(--surface-raised);border:1.5px solid var(--line);border-radius:18px;padding:18px">
          <h3 style="font-size:18px;margin-bottom:6px">ℹ️ About Tiny Wins OS</h3>
          <p style="color:var(--mute);font-size:14px;margin:0">
            Version 2.0 (Phase 1 Build) · Clean ES Modules · 100% Client-Side + Supabase Realtime.<br>
            Designed exclusively for Shaurya Singh.
          </p>
        </div>
      </div>
    </section>
  `;
}
