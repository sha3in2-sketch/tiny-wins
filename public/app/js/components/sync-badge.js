/* ==========================================================================
   TINYWINS OS — SYNC BADGE COMPONENT
   ========================================================================== */
import { syncStatus } from '../sync.js';

export function renderSyncBadge() {
  const isOnline = syncStatus === 'connected';
  const isSyncing = syncStatus === 'syncing' || syncStatus === 'connecting';

  const badgeClass = isOnline
    ? 'sync-badge online'
    : isSyncing
    ? 'sync-badge syncing'
    : 'sync-badge';

  const label = isOnline
    ? '24/7 Synced'
    : isSyncing
    ? 'Syncing...'
    : 'Offline';

  return `
    <button class="${badgeClass}" id="sync-badge" data-action="open-pairing-modal" title="24/7 Cloud Sync & Connect Phone">
      <span class="sync-dot"></span>
      <span>${label}</span>
    </button>
  `;
}
