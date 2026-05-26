const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");
const netlifyConfig = fs.readFileSync("netlify.toml", "utf8");
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
  'function shareCaption()',
  'function recordShareUrl()',
  'url: recordShareUrl()',
  'navigator.clipboard.writeText(`${shareCaption()}\\n${recordShareUrl()}`)',
  'SEKARANG SAYA CHALLENGE AWAK',
  'LARI DARI ORANG MASJID!!'
];

const requiredNetlifyConfig = [
  'functions = "netlify/functions"',
  'from = "/record"',
  'to = "/.netlify/functions/record"',
  'from = "/record-image.png"',
  'to = "/.netlify/functions/record-image"'
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
