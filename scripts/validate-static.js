const fs = require("fs");

const html = fs.readFileSync("index.html", "utf8");
const requiredHtml = [
  '<meta name="description"',
  '<meta name="theme-color"',
  '<meta property="og:title"',
  '<meta property="og:description"',
  '<meta property="og:image" content="https://salam-aidiladha-wish.netlify.app/og-image.svg">',
  '<meta property="og:url" content="https://salam-aidiladha-wish.netlify.app/">',
  '<meta name="twitter:card"',
  '<meta name="twitter:image" content="https://salam-aidiladha-wish.netlify.app/og-image.svg">',
  '<link rel="canonical" href="https://salam-aidiladha-wish.netlify.app/">',
  '<link rel="manifest" href="/site.webmanifest">',
  '<link rel="icon" href="/icon.svg"',
  'Built by <a href="https://haikalfadzli.cekap.work"',
  'id="shareButton"',
  'async function createRecordSnapshot()',
  'async function shareRecord()'
];

for (const fragment of requiredHtml) {
  if (!html.includes(fragment)) {
    throw new Error(`Missing required HTML fragment: ${fragment}`);
  }
}

for (const asset of ["site.webmanifest", "icon.svg", "og-image.svg"]) {
  fs.accessSync(asset, fs.constants.R_OK);
}

const manifest = JSON.parse(fs.readFileSync("site.webmanifest", "utf8"));
if (manifest.display !== "standalone") {
  throw new Error("Manifest display must be standalone");
}

console.log("Static Netlify build ready");
