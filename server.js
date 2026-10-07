const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { WebSocketServer, WebSocket } = require('ws');
const QRCode = require('qrcode');

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial state
let appState = {
  days: {},
  weeks: {},
  lastUpdated: Date.now()
};

// Load saved data if present
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      appState.days = parsed.days || {};
      appState.weeks = parsed.weeks || {};
      appState.lastUpdated = parsed.lastUpdated || Date.now();
      console.log('✓ Loaded existing tasks and planner data from disk.');
    }
  } catch (err) {
    console.error('Error reading tasks.json:', err.message);
  }
}

// Save state to disk safely
function saveStateToDisk() {
  try {
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(appState, null, 2), 'utf8');
    fs.renameSync(tempFile, DATA_FILE);
  } catch (err) {
    console.error('Failed to save state to disk:', err.message);
  }
}

// Get non-internal IPv4 address
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push({ name, address: net.address });
      }
    }
  }
  return addresses;
}

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);

// WebSocket server setup
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(messageStr, excludeClientId) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      if (!excludeClientId || client.clientId !== excludeClientId) {
        client.send(messageStr);
      }
    }
  });
}

function broadcastClientCount() {
  const count = wss.clients.size;
  const msg = JSON.stringify({ type: 'clients_count', count });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

// API endpoint to get info & QR code for pairing with mobile phone
app.get('/api/connect-info', async (req, res) => {
  const ips = getLocalIpAddresses();
  const primaryIp = ips.length > 0 ? ips[0].address : 'localhost';
  const networkUrl = `http://${primaryIp}:${PORT}`;
  const localUrl = `http://localhost:${PORT}`;

  let qrDataUrl = '';
  try {
    qrDataUrl = await QRCode.toDataURL(networkUrl, {
      margin: 2,
      width: 280,
      color: {
        dark: '#2b2850',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('QR code generation failed:', err.message);
  }

  res.json({
    localUrl,
    networkUrl,
    ipList: ips.map(i => `http://${i.address}:${PORT}`),
    qrDataUrl,
    clientsCount: wss.clients.size
  });
});

// REST API for state
app.get('/api/state', (req, res) => {
  res.json({
    days: appState.days,
    weeks: appState.weeks,
    lastUpdated: appState.lastUpdated
  });
});

app.post('/api/state', (req, res) => {
  const { days, weeks, senderId } = req.body || {};
  if (days && typeof days === 'object') appState.days = days;
  if (weeks && typeof weeks === 'object') appState.weeks = weeks;
  appState.lastUpdated = Date.now();
  saveStateToDisk();

  // Broadcast to WebSockets
  broadcast(
    JSON.stringify({
      type: 'sync',
      data: { days: appState.days, weeks: appState.weeks },
      senderId: senderId || null,
      lastUpdated: appState.lastUpdated
    }),
    senderId
  );

  res.json({ ok: true, lastUpdated: appState.lastUpdated });
});

// Fallback to index.html for any frontend SPA navigation (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.clientId = Math.random().toString(36).slice(2, 9);

  // Send initial full state and client count
  ws.send(
    JSON.stringify({
      type: 'init',
      data: { days: appState.days, weeks: appState.weeks },
      clientId: ws.clientId,
      lastUpdated: appState.lastUpdated
    })
  );

  broadcastClientCount();

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);
      if (msg.type === 'sync' && msg.data) {
        if (msg.data.days && typeof msg.data.days === 'object') {
          appState.days = msg.data.days;
        }
        if (msg.data.weeks && typeof msg.data.weeks === 'object') {
          appState.weeks = msg.data.weeks;
        }
        appState.lastUpdated = msg.timestamp || Date.now();
        saveStateToDisk();

        // Forward to all other clients
        broadcast(
          JSON.stringify({
            type: 'sync',
            data: { days: appState.days, weeks: appState.weeks },
            senderId: msg.clientId || ws.clientId,
            lastUpdated: appState.lastUpdated
          }),
          msg.clientId || ws.clientId
        );
      } else if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (e) {
      console.error('WebSocket message parsing error:', e.message);
    }
  });

  ws.on('close', () => {
    broadcastClientCount();
  });
});

// Periodic heartbeat check
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(heartbeatInterval);
});

// Start listening
server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIpAddresses();
  console.log('\n======================================================');
  console.log(' ✨ Tiny Wins - Real-Time Server Running! ✨');
  console.log('======================================================');
  console.log(` 💻 Laptop (Local):      http://localhost:${PORT}`);
  if (ips.length > 0) {
    ips.forEach(ip => {
      console.log(` 📱 Phone / Other Device: http://${ip.address}:${PORT} (${ip.name})`);
    });
  }
  console.log('======================================================');
  console.log(' 👉 Scan the QR Code inside the app to connect your phone!');
  console.log(' 👉 Tap "Install" or "Add to Home Screen" to use as a native app.');
  console.log('======================================================\n');
});
