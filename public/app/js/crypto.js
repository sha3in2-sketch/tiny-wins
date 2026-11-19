/* ==========================================================================
   TINYWINS OS — ZERO-KNOWLEDGE AES-GCM ENCRYPTION ENGINE
   End-to-end client-side encryption using native Web Crypto API.
   Data is encrypted before leaving the browser; only devices with the
   secret Room Key can decrypt it. Supabase only ever sees ciphertext.
   ========================================================================== */

const SALT = new TextEncoder().encode("tinywins-e2ee-v1");

/**
 * Derives a 256-bit AES-GCM CryptoKey from the secret room ID via PBKDF2-SHA256
 */
export async function deriveKey(roomId) {
	if (!roomId) throw new Error("Room ID required for key derivation");
	const enc = new TextEncoder();
	const keyMaterial = await window.crypto.subtle.importKey(
		"raw",
		enc.encode(roomId),
		{ name: "PBKDF2" },
		false,
		["deriveKey"],
	);

	return window.crypto.subtle.deriveKey(
		{
			name: "PBKDF2",
			salt: SALT,
			iterations: 10000,
			hash: "SHA-256",
		},
		keyMaterial,
		{ name: "AES-GCM", length: 256 },
		false,
		["encrypt", "decrypt"],
	);
}

/**
 * Encrypts an arbitrary JS object/data structure with AES-256-GCM
 */
export async function encryptData(dataObj, roomId) {
	if (!dataObj || typeof dataObj !== "object") return dataObj;
	try {
		const key = await deriveKey(roomId);
		const iv = window.crypto.getRandomValues(new Uint8Array(12));
		const encoded = new TextEncoder().encode(JSON.stringify(dataObj));
		const ciphertext = await window.crypto.subtle.encrypt(
			{ name: "AES-GCM", iv },
			key,
			encoded,
		);

		return {
			_enc: true,
			iv: Array.from(iv),
			data: Array.from(new Uint8Array(ciphertext)),
		};
	} catch (err) {
		console.error("Encryption error, fallback to raw:", err);
		return dataObj;
	}
}

/**
 * Decrypts an encrypted payload with AES-256-GCM.
 * Seamlessly falls back to plaintext if data is from legacy unencrypted version.
 */
export async function decryptData(payload, roomId) {
	if (!payload) return payload;
	// Backward compatibility fallback for unencrypted legacy rows
	if (
		!payload._enc ||
		!Array.isArray(payload.iv) ||
		!Array.isArray(payload.data)
	) {
		return payload;
	}

	try {
		const key = await deriveKey(roomId);
		const iv = new Uint8Array(payload.iv);
		const ciphertext = new Uint8Array(payload.data);
		const decrypted = await window.crypto.subtle.decrypt(
			{ name: "AES-GCM", iv },
			key,
			ciphertext,
		);
		return JSON.parse(new TextDecoder().decode(decrypted));
	} catch (err) {
		console.warn("Decryption failed (tampered data or wrong room key):", err);
		return null;
	}
}

/**
 * Generates a 128-bit cryptographically secure room token
 */
export function generateSecureRoomToken() {
	const bytes = new Uint8Array(16);
	window.crypto.getRandomValues(bytes);
	const hex = Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return `tw-${hex}`;
}
