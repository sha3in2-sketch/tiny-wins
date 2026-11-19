# 🔒 Security Policy & Cryptographic Architecture

Tiny Wins OS is built on a **Zero-Knowledge, Client-Side Encrypted** architecture. We take user privacy, security, and data sovereignty seriously.

---

## 🛡️ Supported Versions

We actively maintain and provide security patches for the following versions:

| Version | Supported | Description |
| :--- | :---: | :--- |
| **2.x (Tiny Wins OS)** | ✅ | Modern modular OS with AES-256-GCM Zero-Knowledge Encryption |
| **1.x (Legacy Prototype)** | ⚠️ | Single-file prototype (unencrypted sync - upgrade recommended) |

---

## 🔐 Cryptographic Architecture & Threat Model

### 1. Zero-Knowledge Client-Side Encryption (AES-256-GCM)
* **At Rest & In Transit**: All user data (task titles, dates, habit matrices, calendar commitments, and reflections) is encrypted **locally in the browser** before being transmitted to the cloud.
* **Ciphertext Storage**: Supabase Realtime stores only randomized ciphertext envelopes:
  ```json
  {
    "_enc": true,
    "iv": [24, 189, 72, 105, 33, 91, 14, 202, ...],
    "data": [198, 44, 112, 5, 230, 89, 147, ...]
  }
  ```
* **Key Derivation**: Keys are derived from the secret Room Key using **PBKDF2 with SHA-256** (10,000 iterations) via the browser-native `window.crypto.subtle` API.
* **Tamper Proofing**: AES-256-GCM includes an authenticated verification tag. If an unauthorized entity alters or injects records without the secret room key, the client rejects the payload with an `OperationError`.

### 2. Multi-Tenant Room Isolation
* **128-bit Cryptographic Entropy**: Every user session generates a cryptographically random room key using `crypto.getRandomValues()` (e.g., `tw-` + 32 hex characters).
* **Code Clone Safety**: If a third party downloads or clones this repository from GitHub, **their browser automatically generates its own independent room key**. They can never see, modify, or interfere with another user's data.
* **Search Space**: With $2^{128} \approx 3.4 \times 10^{38}$ possible room keys, guessing or brute-forcing a room key is computationally impossible.

### 3. QR Code Pairing & URL Sanitization
* **Leak Prevention**: When scanning the pairing QR code (`?room=...`), the application immediately stores the key in the device's private `localStorage` and scrubs the query parameter from the browser address bar and history via `window.history.replaceState`.
* **Instant Device Revocation**: Tapping **"🔒 Disconnect Other Devices / Reset Key"** deletes the old cloud row from the database and rotates to a new 128-bit key, instantly revoking access from all previously paired devices.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability or privacy concern within Tiny Wins OS, please report it responsibly:

1. **Do not create a public GitHub issue.**
2. Send a confidential report to **`sha3in2@gmail.com`** or open a private GitHub Security Advisory.
3. Include:
   - A detailed description of the vulnerability.
   - Step-by-step reproduction steps or Proof of Concept (PoC).
   - The affected component (e.g. `crypto.js`, `sync.js`, `store.js`).

### Our Commitment:
- We acknowledge receipt of security reports within **48 hours**.
- We provide an estimated timeline for remediation and coordinate responsible disclosure.
- Security updates are pushed to GitHub Pages and the PWA immediately upon validation.
