/* ==========================================================================
   TINYWINS OS — 24/7 SUPABASE CLOUD SYNC
   ========================================================================== */
import { getRoomId, STATE, saveState, setRoomId } from "./store.js";
import { debounce } from "./utils/debounce.js";

export const SUPABASE_URL = "https://qkcfpxqrxhxdfdycvnuu.supabase.co";
export const SUPABASE_ANON_KEY =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrY2ZweHFyeGh4ZGZkeWN2bnV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNDc3MDQsImV4cCI6MjEwNjkyMzcwNH0.CVtDAijw3pzFECAHkp2OuDJUNpftzRUkLtEoQwuf2Mk";

export const clientId = Math.random().toString(36).slice(2, 9);

let supabaseClient = null;
let realtimeChannel = null;
export let syncStatus = "connecting"; // 'connecting' | 'connected' | 'offline'

const statusListeners = new Set();

export function onSyncStatusChange(fn) {
	statusListeners.add(fn);
	fn(syncStatus);
	return () => statusListeners.delete(fn);
}

function updateStatus(newStatus) {
	syncStatus = newStatus;
	statusListeners.forEach((fn) => {
		try {
			fn(syncStatus);
		} catch (_e) {}
	});
}

export function initSync() {
	if (!window.supabase) {
		setTimeout(initSync, 300);
		return;
	}
	supabaseClient = window.supabase.createClient(
		SUPABASE_URL,
		SUPABASE_ANON_KEY,
	);
	syncWithCloud();
}

export async function syncWithCloud() {
	if (!supabaseClient) return;

	const currentRoomId = getRoomId();
	try {
		updateStatus("connecting");

		// 1. Fetch current room state from cloud
		const { data, error } = await supabaseClient
			.from("sync_rooms")
			.select("days, weeks, sender_id, updated_at")
			.eq("room_id", currentRoomId)
			.maybeSingle();

		if (error) {
			console.error("Fetch room error:", error);
			updateStatus("offline");
		} else if (data) {
			const cloudHasTasks =
				(data.days && Object.keys(data.days).length > 0) ||
				(data.weeks && Object.keys(data.weeks).length > 0);
			const localHasTasks =
				(STATE.days && Object.keys(STATE.days).length > 0) ||
				(STATE.weeks && Object.keys(STATE.weeks).length > 0);

			if (cloudHasTasks || !localHasTasks) {
				Object.assign(STATE.days, data.days || {});
				Object.assign(STATE.weeks, data.weeks || {});
				saveState();
			} else if (localHasTasks && !cloudHasTasks) {
				pushStateToCloud();
			}
			updateStatus("connected");
		} else {
			// Room doesn't exist yet in cloud -> initialize it
			pushStateToCloud();
			updateStatus("connected");
		}

		// 2. Subscribe to Realtime Postgres changes
		if (realtimeChannel) {
			supabaseClient.removeChannel(realtimeChannel);
		}

		realtimeChannel = supabaseClient
			.channel(`sync-room-${currentRoomId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "sync_rooms",
					filter: `room_id=eq.${currentRoomId}`,
				},
				(payload) => {
					const newRow = payload.new;
					if (newRow && newRow.sender_id !== clientId) {
						Object.assign(STATE.days, newRow.days || {});
						Object.assign(STATE.weeks, newRow.weeks || {});
						saveState();
					}
				},
			)
			.subscribe((status) => {
				if (status === "SUBSCRIBED") {
					updateStatus("connected");
				} else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
					updateStatus("offline");
				}
			});
	} catch (err) {
		console.error("Cloud sync error:", err);
		updateStatus("offline");
	}
}

// Push local state to Cloud
export async function pushStateToCloud() {
	if (!supabaseClient) return;
	const currentRoomId = getRoomId();
	try {
		updateStatus("syncing");
		await supabaseClient.from("sync_rooms").upsert({
			room_id: currentRoomId,
			days: STATE.days,
			weeks: STATE.weeks,
			sender_id: clientId,
			updated_at: new Date().toISOString(),
		});
		updateStatus("connected");
	} catch (err) {
		console.error("Failed to push state to cloud:", err);
		updateStatus("offline");
	}
}

export const debouncedPush = debounce(pushStateToCloud, 350);

// Switch room manually
export function switchRoom(newRoomId) {
	if (!newRoomId?.trim()) return;
	setRoomId(newRoomId);
	syncWithCloud();
}

// Revoke access from other devices by rotating room code
export async function revokeAndRegenerateRoom() {
	const currentRoomId = getRoomId();
	const newRoomId =
		"tiny-" +
		Math.random().toString(36).slice(2, 8) +
		Math.random().toString(36).slice(2, 8);

	if (supabaseClient) {
		// 1. Move tasks to new room
		await supabaseClient.from("sync_rooms").upsert({
			room_id: newRoomId,
			days: STATE.days,
			weeks: STATE.weeks,
			sender_id: clientId,
			updated_at: new Date().toISOString(),
		});

		// 2. Wipe old room so other devices see blank
		await supabaseClient.from("sync_rooms").upsert({
			room_id: currentRoomId,
			days: {},
			weeks: {},
			sender_id: clientId,
			updated_at: new Date().toISOString(),
		});
	}

	switchRoom(newRoomId);
}
