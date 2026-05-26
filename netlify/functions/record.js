function cleanNumber(value, fallback = 0, max = 999) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(number, max));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getBaseUrl(event) {
  const headers = event.headers || {};
  const host = headers["x-forwarded-host"] || headers.host || "localhost:8888";
  const proto = headers["x-forwarded-proto"] || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const score = cleanNumber(params.score, 0, 999);
  const baseUrl = getBaseUrl(event);
  const recordUrl = `${baseUrl}/record?score=${score}`;
  const imageUrl = `${baseUrl}/record-image.png?score=${score}`;
  const title = `Score Saya ${String(score).padStart(3, "0")} | Salam Aidiladha`;
  const description = `Selamat Hari Raya Aidiladha. Semoga ibadah korban dan semangat pengorbanan kita pada tahun ini membawa keberkatan, keampunan, dan kebahagiaan yang berpanjangan buat kita sekeluarga. Saya dapat score ${score} dalam game kad Aidiladha, dan sekarang saya challenge kamu untuk beat score saya.`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate"
    },
    body: `<!doctype html>
<html lang="ms">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(recordUrl)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ms_MY">
  <meta property="og:url" content="${escapeHtml(recordUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
  <meta http-equiv="refresh" content="1; url=/?from=record&score=${score}">
  <style>
    :root { color-scheme: only light; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #f7f7f7;
      color: #343536;
      font-family: ui-monospace, Menlo, Consolas, monospace;
      text-align: center;
    }
    a { color: #27272a; font-weight: 800; }
  </style>
</head>
<body>
  <main>
    <h1>Score ${String(score).padStart(3, "0")}</h1>
    <p>${escapeHtml(description)}</p>
    <p><a href="/">Main sekarang</a></p>
  </main>
</body>
</html>`
  };
};
