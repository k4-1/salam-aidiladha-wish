const zlib = require("zlib");

const WIDTH = 1200;
const HEIGHT = 630;
const COLORS = {
  paper: [247, 247, 247, 255],
  ink: [52, 53, 54, 255],
  title: [39, 39, 42, 255],
  soft: [113, 113, 122, 255]
};

const GLYPHS = {
  " ": ["000", "000", "000", "000", "000", "000", "000"],
  ".": ["0", "0", "0", "0", "0", "0", "1"],
  "-": ["000", "000", "000", "111", "000", "000", "000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10011", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"]
};

function cleanNumber(value, fallback = 0, max = 999) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(number, max));
}

function createCanvas() {
  const data = Buffer.alloc(WIDTH * HEIGHT * 4);
  fill(data, COLORS.paper);
  return data;
}

function pixel(data, x, y, color) {
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const offset = (Math.floor(y) * WIDTH + Math.floor(x)) * 4;
  data[offset] = color[0];
  data[offset + 1] = color[1];
  data[offset + 2] = color[2];
  data[offset + 3] = color[3];
}

function rect(data, x, y, w, h, color) {
  for (let yy = Math.max(0, y); yy < Math.min(HEIGHT, y + h); yy += 1) {
    for (let xx = Math.max(0, x); xx < Math.min(WIDTH, x + w); xx += 1) {
      pixel(data, xx, yy, color);
    }
  }
}

function fill(data, color) {
  for (let i = 0; i < data.length; i += 4) {
    data[i] = color[0];
    data[i + 1] = color[1];
    data[i + 2] = color[2];
    data[i + 3] = color[3];
  }
}

function strokeRect(data, x, y, w, h, size, color) {
  rect(data, x, y, w, size, color);
  rect(data, x, y + h - size, w, size, color);
  rect(data, x, y, size, h, color);
  rect(data, x + w - size, y, size, h, color);
}

function measureText(text, scale) {
  return [...text].reduce((sum, char) => {
    const glyph = GLYPHS[char.toUpperCase()] || GLYPHS[" "];
    return sum + (glyph[0].length + 1) * scale;
  }, 0);
}

function text(data, value, centerX, y, scale, color) {
  const source = String(value).toUpperCase();
  let x = Math.round(centerX - measureText(source, scale) / 2);
  for (const char of source) {
    const glyph = GLYPHS[char] || GLYPHS[" "];
    for (let row = 0; row < glyph.length; row += 1) {
      for (let col = 0; col < glyph[row].length; col += 1) {
        if (glyph[row][col] === "1") {
          rect(data, x + col * scale, y + row * scale, scale, scale, color);
        }
      }
    }
    x += (glyph[0].length + 1) * scale;
  }
}

function drawScene(data) {
  rect(data, 110, 452, 980, 6, COLORS.ink);
  rect(data, 210, 384, 34, 68, COLORS.ink);
  rect(data, 196, 374, 56, 14, COLORS.ink);
  rect(data, 208, 356, 30, 20, COLORS.ink);
  rect(data, 488, 374, 112, 56, COLORS.ink);
  rect(data, 590, 360, 52, 48, COLORS.ink);
  rect(data, 630, 382, 28, 20, COLORS.ink);
  rect(data, 604, 378, 10, 10, COLORS.paper);
  rect(data, 504, 430, 18, 44, COLORS.ink);
  rect(data, 566, 430, 18, 44, COLORS.ink);
  rect(data, 474, 386, 18, 12, COLORS.ink);
  rect(data, 876, 370, 16, 84, COLORS.ink);
  rect(data, 936, 370, 16, 84, COLORS.ink);
  rect(data, 852, 404, 120, 14, COLORS.ink);
  rect(data, 852, 438, 120, 14, COLORS.ink);
}

function crc32(buffer) {
  let crc = -1;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(data) {
  const raw = Buffer.alloc((WIDTH * 4 + 1) * HEIGHT);
  for (let y = 0; y < HEIGHT; y += 1) {
    const rowStart = y * (WIDTH * 4 + 1);
    raw[rowStart] = 0;
    data.copy(raw, rowStart + 1, y * WIDTH * 4, (y + 1) * WIDTH * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(WIDTH, 0);
  ihdr.writeUInt32BE(HEIGHT, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const score = cleanNumber(params.score, 0, 999);
  const miss = cleanNumber(params.miss, 0, 5);
  const paddedScore = String(score).padStart(3, "0");
  const data = createCanvas();

  strokeRect(data, 48, 48, 1104, 534, 10, COLORS.ink);
  text(data, "SALAM AIDILADHA", 600, 106, 10, COLORS.title);
  text(data, "SCORE ANDA", 600, 188, 6, COLORS.soft);
  text(data, paddedScore, 600, 246, 28, COLORS.title);
  text(data, `MISS ${miss}/5`, 600, 438, 5, COLORS.soft);
  text(data, "JOM CUBA KALAHKAN SCORE SAYA", 600, 512, 5, COLORS.title);
  text(data, "SALAM-AIDILADHA-WISH.NETLIFY.APP", 600, 558, 2, COLORS.soft);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable"
    },
    isBase64Encoded: true,
    body: encodePng(data).toString("base64")
  };
};
