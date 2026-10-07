const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// 1. Create crisp SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8b7cf6"/>
      <stop offset="100%" stop-color="#6d5be4"/>
    </linearGradient>
    <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe066"/>
      <stop offset="100%" stop-color="#ffb72b"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#2b2850" flood-opacity="0.25"/>
    </filter>
  </defs>

  <!-- Background rounded rectangle -->
  <rect width="512" height="512" rx="128" fill="url(#bgGrad)"/>

  <!-- Golden rotated badge with shadow -->
  <g transform="translate(256,256) rotate(-8) translate(-140,-140)" filter="url(#shadow)">
    <rect width="280" height="280" rx="76" fill="url(#sunGrad)"/>
    
    <!-- Sparkle 1 (Large center) -->
    <path d="M 140 45 C 140 100 185 140 235 140 C 185 140 140 180 140 235 C 140 180 95 140 45 140 C 95 140 140 100 140 45 Z" fill="#ffffff" />
    <path d="M 140 65 C 140 110 175 140 215 140 C 175 140 140 170 140 215 C 140 170 105 140 65 140 C 105 140 140 110 140 65 Z" fill="#fff7d6" opacity="0.8"/>

    <!-- Sparkle 2 (Small top right) -->
    <path d="M 215 45 C 215 65 230 75 245 75 C 230 75 215 85 215 105 C 215 85 200 75 185 75 C 200 75 215 65 215 45 Z" fill="#ffffff" opacity="0.9"/>
  </g>
</svg>`;

const iconSvgPath = path.join(__dirname, 'public', 'icons', 'icon.svg');
fs.writeFileSync(iconSvgPath, svgContent);
fs.writeFileSync(path.join(__dirname, 'public', 'favicon.svg'), svgContent);

// Simple pure node function to create valid PNG from RGBA buffer
function createPng(width, height, rgbaBuffer) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // color type RGBA (6)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines with filter type 0 (None)
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    scanlines[rowOffset] = 0; // Filter 0
    rgbaBuffer.copy(scanlines, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  // IDAT chunk
  const compressed = zlib.deflateSync(scanlines);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const typeAndData = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crcBuf]);
}

function renderRasterIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const center = size / 2;
  const radius = size * 0.44;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      
      // Rounded card background
      const cornerR = size * 0.22;
      const dx = Math.abs(x - center) - (center - cornerR);
      const dy = Math.abs(y - center) - (center - cornerR);
      const dist = (dx > 0 && dy > 0) ? Math.sqrt(dx*dx + dy*dy) - cornerR : Math.max(dx, dy) - cornerR;

      if (dist <= 0) {
        // Inside background: violet #7b6cf0
        buf[idx] = 0x7b;     // R
        buf[idx + 1] = 0x6c; // G
        buf[idx + 2] = 0xf0; // B
        buf[idx + 3] = 0xff; // A

        // Golden badge in center (rotated ~ -8 deg)
        const rad = -8 * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const rx = cos * (x - center) - sin * (y - center);
        const ry = sin * (x - center) + cos * (y - center);
        const badgeSize = size * 0.55;
        const badgeCorner = badgeSize * 0.3;
        const bdx = Math.abs(rx) - (badgeSize/2 - badgeCorner);
        const bdy = Math.abs(ry) - (badgeSize/2 - badgeCorner);
        const bdist = (bdx > 0 && bdy > 0) ? Math.sqrt(bdx*bdx + bdy*bdy) - badgeCorner : Math.max(bdx, bdy) - badgeCorner;

        if (bdist <= 0) {
          // Inside golden badge #ffc94d
          buf[idx] = 0xff;
          buf[idx + 1] = 0xc9;
          buf[idx + 2] = 0x4d;
          buf[idx + 3] = 0xff;

          // Simple 4-point star in center
          const sx = Math.abs(rx);
          const sy = Math.abs(ry);
          const starR = size * 0.18;
          // Star formula: (sx/a)^0.5 + (sy/b)^0.5 <= 1
          if (Math.sqrt(sx / starR) + Math.sqrt(sy / starR) <= 1.0) {
            buf[idx] = 0xff;
            buf[idx + 1] = 0xff;
            buf[idx + 2] = 0xff;
            buf[idx + 3] = 0xff;
          }
        }
      } else {
        // Transparent outside
        buf[idx] = 0;
        buf[idx + 1] = 0;
        buf[idx + 2] = 0;
        buf[idx + 3] = 0;
      }
    }
  }
  return createPng(size, size, buf);
}

// Generate PNG icons
const p192 = renderRasterIcon(192);
fs.writeFileSync(path.join(__dirname, 'public', 'icons', 'icon-192.png'), p192);
const p512 = renderRasterIcon(512);
fs.writeFileSync(path.join(__dirname, 'public', 'icons', 'icon-512.png'), p512);
fs.writeFileSync(path.join(__dirname, 'public', 'icons', 'icon-maskable-512.png'), p512);
console.log('Icons generated successfully!');
