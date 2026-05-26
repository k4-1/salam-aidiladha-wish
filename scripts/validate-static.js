const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");
const netlifyConfig = fs.readFileSync("netlify.toml", "utf8");
const recordFunction = fs.readFileSync("netlify/functions/record.js", "utf8");
const recordImageFunction = fs.readFileSync("netlify/functions/record-image.js", "utf8");
const requiredHtml = [
  '<meta name="description"',
  '<meta name="theme-color"',
  '<meta property="og:title"',
  '<meta property="og:description"',
  '<meta property="og:image" content="https://salam-aidiladha.netlify.app/og-image.svg">',
  '<meta property="og:url" content="https://salam-aidiladha.netlify.app/">',
  '<meta name="twitter:card"',
  '<meta name="twitter:image" content="https://salam-aidiladha.netlify.app/og-image.svg">',
  '<link rel="canonical" href="https://salam-aidiladha.netlify.app/">',
  '<link rel="manifest" href="/site.webmanifest">',
  '<link rel="icon" href="/icon.svg"',
  'Built by <a href="https://haikalfadzli.cekap.work"',
  'id="shareButton"',
  'async function createRecordSnapshot()',
  'async function shareRecordLink()',
  'function shareCaptionText()',
  'function shareCaption(',
  'function recordShareUrl()',
  'return `${SHARE_URL}s/${score}`',
  'const shareUrl = recordShareUrl()',
  'text: captionText',
  'url: shareUrl',
  'navigator.clipboard.writeText(caption)',
  'drawCowHorns',
  'drawBajuMelayu',
  'COW_W: 96',
  'COW_H: 82',
  'SEKARANG SAYA CHALLENGE AWAK',
  'LARI DARI ORANG MASJID!!'
];

const requiredRecordImage = [
  'const unit = 3',
  'block(7, 23, 64, 33, COLORS.ink)',
  'block(60, 18, 28, 28, COLORS.ink)',
  'drawPreviewCow(data, 72, 220)',
  'text(data, "SCORE SAYA", 600, 158, 6, COLORS.soft)',
  'drawPreviewFence(data, 880, 368)'
];

const requiredNetlifyConfig = [
  'functions = "netlify/functions"',
  'from = "/s/:score"',
  'to = "/.netlify/functions/record?score=:score"',
  'from = "/record"',
  'to = "/.netlify/functions/record"',
  'from = "/record-image.png"',
  'to = "/.netlify/functions/record-image"'
];

const forbiddenFragments = [
  [recordFunction, 'meta http-equiv="refresh"', "Record page must not auto-redirect"],
  [recordFunction, "miss=${miss}", "Record share URL must not include miss"],
  [html, "miss=", "HTML share URLs must not include miss"],
  [html, "url: SHARE_URL", "Native share must use score preview URL, not main URL"],
  [html, "${SHARE_URL}record?score=${score}", "HTML must use the short score preview URL"],
  [recordImageFunction, "MISS ", "Record preview must not include miss text"],
  [recordImageFunction, "SALAM-AIDILADHA-WISH.NETLIFY.APP", "Record preview must not include old project link"],
  [recordImageFunction, "drawPreviewChaser", "Record preview must not include orang masjid"],
  [html, "drawCowMuzzle", "Cow must not include pig-like muzzle helper"],
  [html, "drawCowNose", "Cow must not include a nose helper"],
  [html, "salam-aidiladha-wish.netlify.app", "HTML must not reference old Netlify domain"]
];

for (const fragment of requiredHtml) {
  if (!html.includes(fragment)) {
    throw new Error(`Missing required HTML fragment: ${fragment}`);
  }
}

for (const fragment of requiredNetlifyConfig) {
  if (!netlifyConfig.includes(fragment)) {
    throw new Error(`Missing required Netlify config: ${fragment}`);
  }
}

for (const fragment of requiredRecordImage) {
  if (!recordImageFunction.includes(fragment)) {
    throw new Error(`Missing required record image fragment: ${fragment}`);
  }
}

for (const [source, fragment, message] of forbiddenFragments) {
  if (source.includes(fragment)) {
    throw new Error(message);
  }
}

for (const asset of [
  "site.webmanifest",
  "icon.svg",
  "og-image.svg",
  "netlify/functions/record.js",
  "netlify/functions/record-image.js"
]) {
  fs.accessSync(asset, fs.constants.R_OK);
}

const manifest = JSON.parse(fs.readFileSync("site.webmanifest", "utf8"));
if (manifest.display !== "standalone") {
  throw new Error("Manifest display must be standalone");
}

console.log("Static Netlify build ready");
