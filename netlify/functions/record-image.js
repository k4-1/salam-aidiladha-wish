function cleanNumber(value, fallback = 0, max = 999) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(number, max));
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const score = cleanNumber(params.score, 0, 999);
  const miss = cleanNumber(params.miss, 0, 5);
  const paddedScore = String(score).padStart(3, "0");

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable"
    },
    body: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">Salam Aidiladha score ${paddedScore}</title>
  <desc id="desc">Record image for the Aidiladha game with score ${score} and miss ${miss}.</desc>
  <rect width="1200" height="630" fill="#f7f7f7"/>
  <rect x="48" y="48" width="1104" height="534" fill="none" stroke="#343536" stroke-width="10"/>
  <text x="600" y="116" fill="#27272a" font-family="Menlo, Consolas, monospace" font-size="68" font-weight="900" text-anchor="middle">SALAM AIDILADHA</text>
  <text x="600" y="188" fill="#71717a" font-family="Menlo, Consolas, monospace" font-size="30" font-weight="700" text-anchor="middle">SCORE ANDA</text>
  <text x="600" y="332" fill="#27272a" font-family="Menlo, Consolas, monospace" font-size="154" font-weight="900" text-anchor="middle">${paddedScore}</text>
  <text x="600" y="390" fill="#71717a" font-family="Menlo, Consolas, monospace" font-size="28" font-weight="700" text-anchor="middle">MISS ${miss}/5</text>
  <line x1="112" y1="452" x2="1088" y2="452" stroke="#343536" stroke-width="6"/>
  <g fill="#343536">
    <rect x="208" y="386" width="34" height="66"/><rect x="198" y="404" width="10" height="34"/><rect x="242" y="404" width="10" height="34"/><rect x="194" y="374" width="54" height="14"/><rect x="208" y="360" width="28" height="18"/>
    <rect x="488" y="374" width="112" height="56"/><rect x="590" y="360" width="52" height="48"/><rect x="630" y="380" width="28" height="22"/><rect x="502" y="430" width="18" height="42"/><rect x="566" y="430" width="18" height="42"/><rect x="508" y="472" width="34" height="10"/><rect x="570" y="472" width="34" height="10"/><rect x="474" y="386" width="18" height="12"/><rect x="604" y="378" width="10" height="10" fill="#f7f7f7"/><rect x="612" y="338" width="12" height="22"/><rect x="638" y="338" width="12" height="22"/>
    <rect x="874" y="370" width="16" height="82"/><rect x="936" y="370" width="16" height="82"/><rect x="852" y="404" width="120" height="14"/><rect x="852" y="438" width="120" height="14"/><rect x="864" y="350" width="36" height="22"/><rect x="926" y="350" width="36" height="22"/>
  </g>
  <text x="600" y="526" fill="#27272a" font-family="Menlo, Consolas, monospace" font-size="32" font-weight="900" text-anchor="middle">JOM CUBA KALAHKAN SCORE SAYA</text>
  <text x="600" y="568" fill="#71717a" font-family="Menlo, Consolas, monospace" font-size="25" font-weight="700" text-anchor="middle">salam-aidiladha-wish.netlify.app</text>
</svg>`
  };
};
