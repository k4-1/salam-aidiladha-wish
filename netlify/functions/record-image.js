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
  "!": ["1", "1", "1", "1", "1", "0", "1"],
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

function outlinedText(data, value, centerX, y, scale, color, outlineColor) {
  const outlineStep = Math.max(4, Math.round(scale / 2));
  const offsets = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1]
  ];

  for (const [offsetX, offsetY] of offsets) {
    text(data, value, centerX + offsetX * outlineStep, y + offsetY * outlineStep, scale, outlineColor);
  }

  text(data, value, centerX, y, scale, color);
}

function drawPreviewCow(data, x, y) {
  const unit = 3;
  const block = (dx, dy, w, h, color) => rect(data, x + dx * unit, y + dy * unit, w * unit, h * unit, color);

  block(7, 23, 64, 33, COLORS.ink);
  block(18, 15, 46, 12, COLORS.ink);
  block(15, 55, 9, 19, COLORS.ink);
  block(60, 55, 9, 19, COLORS.ink);
  block(30, 54, 8, 16, COLORS.ink);
  block(47, 54, 8, 16, COLORS.ink);
  block(13, 73, 16, 5, COLORS.ink);
  block(56, 73, 16, 5, COLORS.ink);
  block(2, 20, 12, 3, COLORS.ink);
  block(-2, 17, 5, 5, COLORS.ink);
  block(-5, 13, 5, 6, COLORS.ink);
  block(60, 18, 28, 28, COLORS.ink);
  block(70, 32, 22, 11, COLORS.ink);
  block(52, 19, 10, 11, COLORS.ink);
  block(87, 17, 10, 11, COLORS.ink);
  block(60, 6, 5, 13, COLORS.ink);
  block(52, 1, 13, 5, COLORS.ink);
  block(50, 4, 5, 7, COLORS.ink);
  block(80, 6, 5, 13, COLORS.ink);
  block(82, 1, 13, 5, COLORS.ink);
  block(93, 4, 5, 7, COLORS.ink);
  block(73, 24, 4, 4, COLORS.paper);
  block(22, 30, 18, 11, COLORS.paper);
  block(48, 25, 15, 13, COLORS.paper);
  block(65, 40, 9, 7, COLORS.paper);
  block(40, 53, 15, 7, COLORS.soft);
  block(42, 60, 3, 4, COLORS.soft);
  block(51, 60, 3, 4, COLORS.soft);
}

function drawPreviewFence(data, x, y) {
  rect(data, x, y, 16, 86, COLORS.ink);
  rect(data, x + 70, y, 16, 86, COLORS.ink);
  rect(data, x - 18, y + 30, 122, 14, COLORS.ink);
  rect(data, x - 18, y + 68, 122, 14, COLORS.ink);
}

function drawScene(data) {
  rect(data, 110, 454, 980, 6, COLORS.ink);
  drawPreviewCow(data, 72, 220);
  drawPreviewFence(data, 880, 368);
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
  const paddedScore = String(score).padStart(3, "0");
  const data = createCanvas();

  text(data, "SALAM AIDILADHA", 600, 82, 10, COLORS.title);
  text(data, "SCORE SAYA", 600, 158, 6, COLORS.soft);
  drawScene(data);
  outlinedText(data, paddedScore, 600, 232, 28, COLORS.title, COLORS.paper);
  text(data, "SEKARANG SAYA CHALLENGE AWAK", 600, 516, 5, COLORS.title);
  text(data, "LARI DARI ORANG MASJID!!", 600, 560, 5, COLORS.soft);

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
