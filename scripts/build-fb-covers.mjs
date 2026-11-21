import fs from "node:fs/promises";
import path from "node:path";
import opentype from "opentype.js";
import sharp from "sharp";
import { LOGO_BRANDS, SELECTED_LOGOS } from "../src/lib/logo-concepts.ts";

// Run: node --experimental-strip-types scripts/build-fb-covers.mjs
// Facebook Page cover: upload 1640×624 (2× of 820×312 desktop).
// Mobile shows a ~16:9 centre crop (x≈265–1375) and the profile photo overlaps
// the bottom-left on desktop — critical content stays out of both zones.

const W = 1640;
const H = 624;
const root = process.cwd();
const out = path.join(root, "public/covers");
await fs.mkdir(out, { recursive: true });

const loadFont = async (f) => {
  const b = await fs.readFile(path.join(root, "scripts/assets", f));
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const BOLD = await loadFont("SpaceGrotesk-Bold.ttf");
const MED = await loadFont("SpaceGrotesk-Medium.ttf");

const pathData = (cmds) =>
  cmds
    .map((c) => {
      const n = (k) => {
        if (!Number.isFinite(c[k])) throw new Error(`bad glyph coord ${k}`);
        return c[k].toFixed(2);
      };
      switch (c.type) {
        case "M": case "L": return `${c.type}${n("x")} ${n("y")}`;
        case "Q": return `Q${n("x1")} ${n("y1")} ${n("x")} ${n("y")}`;
        case "C": return `C${n("x1")} ${n("y1")} ${n("x2")} ${n("y2")} ${n("x")} ${n("y")}`;
        case "Z": return "Z";
        default: throw new Error(c.type);
      }
    })
    .join(" ");

/** Outlined text. tracking in px. Returns { d, width }. */
function textD(str, x, y, size, font, tracking = 0) {
  if (!tracking) {
    return { d: pathData(font.getPath(str, x, y, size).commands), width: font.getAdvanceWidth(str, size) };
  }
  let cx = x;
  const parts = [];
  for (const ch of str) {
    const g = font.charToGlyph(ch);
    parts.push(pathData(g.getPath(cx, y, size).commands));
    cx += (g.advanceWidth * size) / font.unitsPerEm + tracking;
  }
  return { d: parts.join(" "), width: cx - x - tracking };
}
const measure = (str, size, font, tracking = 0) => textD(str, 0, 0, size, font, tracking).width;
const T = (str, x, y, size, font, fill, tracking = 0, extra = "") =>
  `<path fill="${fill}" ${extra} d="${textD(str, x, y, size, font, tracking).d}"/>`;

const shapeOf = (brandId) => {
  const brand = LOGO_BRANDS.find((b) => b.id === brandId);
  return brand.concepts.find((c) => c.id === SELECTED_LOGOS[brandId]).shape;
};
const mark = (brandId, color, x, y, size) =>
  `<g transform="translate(${x} ${y}) scale(${size / 128})" color="${color}">${shapeOf(brandId)}</g>`;

/** 4-point sparkle centred at (cx,cy). */
const sparkle = (cx, cy, r, fill, op = 1) =>
  `<path fill="${fill}" opacity="${op}" d="M${cx} ${cy - r}C${cx + r * 0.16} ${cy - r * 0.16} ${cx + r * 0.16} ${cy - r * 0.16} ${cx + r} ${cy}C${cx + r * 0.16} ${cy + r * 0.16} ${cx + r * 0.16} ${cy + r * 0.16} ${cx} ${cy + r}C${cx - r * 0.16} ${cy + r * 0.16} ${cx - r * 0.16} ${cy + r * 0.16} ${cx - r} ${cy}C${cx - r * 0.16} ${cy - r * 0.16} ${cx - r * 0.16} ${cy - r * 0.16} ${cx} ${cy - r}Z"/>`;

/** Chip row (outlined pills). Returns svg. */
function chips(labels, x, y, color, textColor) {
  const size = 17, track = 2.2, padX = 18, h = 40, gap = 10;
  let cx = x, svg = "";
  for (const l of labels) {
    const w = measure(l, size, BOLD, track) + padX * 2;
    svg += `<rect x="${cx}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${color}" fill-opacity="0.10" stroke="${color}" stroke-opacity="0.55" stroke-width="1.5"/>`;
    svg += T(l, cx + padX, y + 26.5, size, BOLD, textColor, track);
    cx += w + gap;
  }
  return svg;
}

/** "Powered by [hive] HIVECOMP" badge, right-aligned at (right, baseline-ish centre y). */
function poweredBy(right, cy) {
  const pbSize = 16, wSize = 23, track = 2.4, markSize = 30, pad = 16;
  const pbW = measure("Powered by", pbSize, MED);
  const hiveW = measure("HIVE", wSize, BOLD, track);
  const compW = measure("COMP", wSize, BOLD, track);
  const inner = pbW + 12 + markSize + 9 + hiveW + track + compW;
  const w = inner + pad * 2, h = 52;
  const x = right - w, y = cy - h / 2;
  let cx = x + pad;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="#0A0A0C" fill-opacity="0.55" stroke="#FFFFFF" stroke-opacity="0.12" stroke-width="1.2"/>`;
  s += T("Powered by", cx, cy + 5.5, pbSize, MED, "#A9A3AE");
  cx += pbW + 12;
  s += mark("hivecomp", "#FFB000", cx, cy - markSize / 2, markSize);
  cx += markSize + 9;
  s += T("HIVE", cx, cy + 8, wSize, BOLD, "#FFFFFF", track);
  cx += hiveW + track;
  s += T("COMP", cx, cy + 8, wSize, BOLD, "#FFB000", track);
  return s;
}

const svgDoc = (body, title) =>
  `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>`;

/* ================================ POPBEEZ ================================ */
function popbeez() {
  const P = "#F54B8D", PD = "#BE225F", V = "#8B5CF6";
  let s = `<defs>
    <radialGradient id="pg1" cx="1240" cy="300" r="640" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${P}" stop-opacity="0.42"/><stop offset="1" stop-color="${P}" stop-opacity="0"/></radialGradient>
    <radialGradient id="pg2" cx="1560" cy="30" r="460" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${V}" stop-opacity="0.32"/><stop offset="1" stop-color="${V}" stop-opacity="0"/></radialGradient>
    <radialGradient id="pg3" cx="260" cy="40" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${P}" stop-opacity="0.12"/><stop offset="1" stop-color="${P}" stop-opacity="0"/></radialGradient>
    <linearGradient id="pfade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.45" stop-color="#fff" stop-opacity="0.2"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
    <mask id="pdotmask"><rect width="${W}" height="${H}" fill="url(#pfade)"/></mask>
    <pattern id="pdots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.7" fill="#FFFFFF" fill-opacity="0.09"/></pattern>
    <linearGradient id="card1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P}"/><stop offset="1" stop-color="${V}"/></linearGradient>
    <linearGradient id="card2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A1424"/><stop offset="1" stop-color="#170E1B"/></linearGradient>
    <linearGradient id="cardimg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF7AAE"/><stop offset="0.55" stop-color="${P}"/><stop offset="1" stop-color="#6D28D9"/></linearGradient>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="14"/><feOffset dy="16"/><feComponentTransfer><feFuncA type="linear" slope="0.55"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>`;
  s += `<rect width="${W}" height="${H}" fill="#0C0910"/>`;
  s += `<rect width="${W}" height="${H}" fill="url(#pg3)"/><rect width="${W}" height="${H}" fill="url(#pg1)"/><rect width="${W}" height="${H}" fill="url(#pg2)"/>`;
  s += `<rect width="${W}" height="${H}" fill="url(#pdots)" mask="url(#pdotmask)"/>`;
  // spotlight beam
  s += `<path d="M1180 -40 L1440 -40 L1340 660 L1000 660 Z" fill="#FFFFFF" opacity="0.035"/>`;
  // concentric rings behind cards
  for (const [r, o] of [[170, 0.22], [250, 0.14], [340, 0.08]]) s += `<circle cx="1225" cy="300" r="${r}" fill="none" stroke="${P}" stroke-opacity="${o}" stroke-width="1.5"/>`;

  // ---- card stack (decorative) ----
  const card = (cx, cy, rot, inner, fill) =>
    `<g transform="translate(${cx} ${cy}) rotate(${rot})" filter="url(#shadow)"><rect x="-130" y="-165" width="260" height="330" rx="22" fill="${fill}" stroke="#FFFFFF" stroke-opacity="0.12"/>${inner}</g>`;
  const ghostLines = `<rect x="-100" y="-130" width="44" height="44" rx="22" fill="#FFFFFF" fill-opacity="0.18"/><rect x="-44" y="-122" width="120" height="12" rx="6" fill="#FFFFFF" fill-opacity="0.22"/><rect x="-44" y="-102" width="70" height="10" rx="5" fill="#FFFFFF" fill-opacity="0.14"/><rect x="-100" y="-62" width="200" height="150" rx="14" fill="#FFFFFF" fill-opacity="0.10"/><rect x="-100" y="104" width="160" height="12" rx="6" fill="#FFFFFF" fill-opacity="0.18"/><rect x="-100" y="126" width="110" height="10" rx="5" fill="#FFFFFF" fill-opacity="0.12"/>`;
  s += card(1105, 318, -11, ghostLines, "url(#card2)");
  s += card(1350, 300, 10, ghostLines, "url(#card2)");
  // front card — a stylised PopBeez news card
  let front = `<rect x="-112" y="-145" width="224" height="40" rx="0" fill="none"/>`;
  front += `<g transform="translate(-104 -146)">${`<g transform="scale(${40 / 128})" color="#FFFFFF">${shapeOf("popbeez")}</g>`}</g>`;
  front += T("PopBeez", -56, -116, 22, BOLD, "#FFFFFF");
  front += `<rect x="40" y="-138" width="64" height="26" rx="13" fill="#FFFFFF" fill-opacity="0.22"/>` + T("IKUTI", 52, -119.5, 13, BOLD, "#FFFFFF", 1.4);
  front += `<rect x="-112" y="-92" width="224" height="150" rx="14" fill="url(#cardimg)"/>`;
  front += sparkle(62, -52, 20, "#FFFFFF", 0.95) + sparkle(-70, 20, 9, "#FFFFFF", 0.7) + sparkle(84, 28, 6, "#FFFFFF", 0.6);
  front += `<rect x="-96" y="22" width="70" height="24" rx="12" fill="#0C0910" fill-opacity="0.55"/>` + T("DRAMA", -86, 39, 12, BOLD, "#FFFFFF", 1.6);
  front += `<rect x="-112" y="74" width="200" height="14" rx="7" fill="#FFFFFF" fill-opacity="0.92"/><rect x="-112" y="96" width="150" height="14" rx="7" fill="#FFFFFF" fill-opacity="0.92"/>`;
  front += `<rect x="-112" y="128" width="224" height="1.2" fill="#FFFFFF" fill-opacity="0.3"/>`;
  front += `<circle cx="-102" cy="146" r="6" fill="#FFFFFF" fill-opacity="0.85"/><circle cx="-80" cy="146" r="6" fill="#FFFFFF" fill-opacity="0.55"/><circle cx="-58" cy="146" r="6" fill="#FFFFFF" fill-opacity="0.55"/>`;
  s += card(1228, 286, -2, front, "url(#card1)");
  s += sparkle(1018, 120, 22, "#FFFFFF", 0.9) + sparkle(1462, 470, 16, P, 0.95) + sparkle(1470, 118, 9, "#FFFFFF", 0.7) + sparkle(985, 470, 8, P, 0.8);

  // ---- brand block (inside mobile-safe zone) ----
  s += `<circle cx="352" cy="242" r="74" fill="${P}" opacity="0.45" filter="url(#soft)"/>`;
  s += mark("popbeez", P, 286, 176, 132);
  s += T("PopBeez", 438, 284, 118, BOLD, "#FFFFFF", 0, "");
  s += `<rect x="292" y="336" width="64" height="4" rx="2" fill="${P}"/>`;
  s += chips(["DRAMA", "FILM", "IDOL", "MANGA", "DONGHUA"], 292, 364, P, "#FFD3E4");

  s += poweredBy(1362, 584);
  return svgDoc(s, "PopBeez — Facebook Page cover");
}

/* =============================== NUSABEEZ =============================== */
function nusabeez() {
  const R = "#EF4B42", RD = "#C7352E", PAPER = "#F3EFE6", INK = "#141821";
  let s = `<defs>
    <radialGradient id="ng1" cx="1250" cy="300" r="620" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${R}" stop-opacity="0.34"/><stop offset="1" stop-color="${R}" stop-opacity="0"/></radialGradient>
    <radialGradient id="ng2" cx="200" cy="0" r="560" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3B82F6" stop-opacity="0.10"/><stop offset="1" stop-color="#3B82F6" stop-opacity="0"/></radialGradient>
    <linearGradient id="nfade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.35"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient>
    <mask id="nmask"><rect width="${W}" height="${H}" fill="url(#nfade)"/></mask>
    <linearGradient id="nphoto" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${R}"/><stop offset="1" stop-color="#3A1214"/></linearGradient>
    <filter id="nsoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="nshadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="14"/><feOffset dy="16"/><feComponentTransfer><feFuncA type="linear" slope="0.6"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>`;
  s += `<rect width="${W}" height="${H}" fill="#0A0D14"/><rect width="${W}" height="${H}" fill="url(#ng2)"/><rect width="${W}" height="${H}" fill="url(#ng1)"/>`;
  // editorial column grid (fades in towards the right)
  let grid = "";
  for (let x = 40; x < W; x += 112) grid += `<rect x="${x}" y="0" width="1" height="${H}" fill="#FFFFFF" fill-opacity="0.07"/>`;
  for (const y of [92, 532]) grid += `<rect x="0" y="${y}" width="${W}" height="1" fill="#FFFFFF" fill-opacity="0.10"/>`;
  s += `<g mask="url(#nmask)">${grid}</g>`;
  // red accent bar top
  s += `<rect x="0" y="0" width="${W}" height="6" fill="${R}"/>`;

  // ---- paper stack (decorative) ----
  const sheet = (cx, cy, rot, inner, fill, stroke = "none") =>
    `<g transform="translate(${cx} ${cy}) rotate(${rot})" filter="url(#nshadow)"><rect x="-150" y="-180" width="300" height="360" rx="14" fill="${fill}" stroke="${stroke}"/>${inner}</g>`;
  const back = `<rect x="-120" y="-150" width="240" height="18" rx="4" fill="#FFFFFF" fill-opacity="0.16"/><rect x="-120" y="-118" width="170" height="12" rx="4" fill="#FFFFFF" fill-opacity="0.10"/><rect x="-120" y="-90" width="240" height="120" rx="8" fill="#FFFFFF" fill-opacity="0.07"/>${[46, 66, 86, 106, 126].map((y) => `<rect x="-120" y="${y}" width="${y === 126 ? 140 : 240}" height="9" rx="4" fill="#FFFFFF" fill-opacity="0.09"/>`).join("")}`;
  s += sheet(1390, 318, 8, back, "#1A1F2B", "#FFFFFF22");
  let front = `<rect x="-150" y="-180" width="300" height="64" rx="14" fill="${R}"/><rect x="-150" y="-140" width="300" height="24" fill="${R}"/>`;
  front += `<g transform="translate(-132 -170) scale(${44 / 128})" color="#FFFFFF">${shapeOf("nusabeez")}</g>`;
  front += T("NusaBeez", -80, -138, 24, BOLD, "#FFFFFF");
  front += `<rect x="62" y="-162" width="70" height="26" rx="13" fill="#FFFFFF" fill-opacity="0.22"/>` + T("IKUTI", 76, -143.5, 13, BOLD, "#FFFFFF", 1.4);
  front += `<rect x="-128" y="-96" width="94" height="24" rx="12" fill="${R}" fill-opacity="0.12"/><circle cx="-114" cy="-84" r="5" fill="${R}"/>` + T("TERKINI", -103, -79, 12, BOLD, RD, 1.6);
  front += `<rect x="-128" y="-60" width="256" height="15" rx="4" fill="${INK}"/><rect x="-128" y="-38" width="196" height="15" rx="4" fill="${INK}"/>`;
  front += `<rect x="-128" y="-6" width="256" height="104" rx="8" fill="url(#nphoto)"/>`;
  front += `<g transform="translate(0 46)"><circle r="26" fill="#FFFFFF" fill-opacity="0.14"/><circle r="12" fill="#FFFFFF" fill-opacity="0.35"/></g>`;
  front += [114, 132, 150].map((y, i) => `<rect x="-128" y="${y}" width="${[256, 230, 150][i]}" height="8" rx="4" fill="${INK}" fill-opacity="0.28"/>`).join("");
  s += sheet(1220, 300, -4, front, PAPER);
  // small editorial accents (kept clear of the card masthead)

  // ---- brand block ----
  s += `<circle cx="352" cy="242" r="74" fill="${R}" opacity="0.38" filter="url(#nsoft)"/>`;
  s += mark("nusabeez", R, 286, 176, 132);
  s += T("NusaBeez", 438, 284, 112, BOLD, "#FFFFFF");
  s += `<rect x="292" y="336" width="64" height="4" rx="2" fill="${R}"/>`;
  s += chips(["NASIONAL", "TERKINI", "RINGKAS"], 292, 364, R, "#FFD6D3");

  s += poweredBy(1362, 584);
  return svgDoc(s, "NusaBeez — Facebook Page cover");
}

/* ============================ RENDER + PREVIEW ============================ */
const covers = { popbeez: popbeez(), nusabeez: nusabeez() };
const BRAND_COLOR = { popbeez: "#F54B8D", nusabeez: "#EF4B42" };

for (const [id, svg] of Object.entries(covers)) {
  if (/NaN|undefined/.test(svg)) throw new Error(`${id}: invalid SVG output`);
  const base = path.join(out, `${id}-facebook-cover`);
  await fs.writeFile(`${base}.svg`, svg);
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  await fs.writeFile(`${base}.png`, png);
  await sharp(png).jpeg({ quality: 92, chromaSubsampling: "4:4:4", mozjpeg: true }).toFile(`${base}.jpg`);

  // Preview: desktop (with profile photo overlap) + mobile 16:9 crop + safe-zone guide
  const PW = 1800, PH = 1240;
  const dW = 1100, dH = Math.round((dW * H) / W);
  const mCropX = Math.round((W - (H * 16) / 9) / 2); // ≈265
  const mCropW = W - mCropX * 2;
  const desktop = await sharp(png).resize(dW, dH).png().toBuffer();
  const mobile = await sharp(png).extract({ left: mCropX, top: 0, width: mCropW, height: H }).resize(520, Math.round((520 * H) / mCropW)).png().toBuffer();
  const guide = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect x="${mCropX}" y="2" width="${mCropW}" height="${H - 4}" fill="none" stroke="#22D3EE" stroke-width="4" stroke-dasharray="18 12"/><rect x="40" y="440" width="380" height="184" fill="#FFFFFF" fill-opacity="0.18" stroke="#FFFFFF" stroke-width="3" stroke-dasharray="10 8"/></svg>`,
  );
  const guidedFull = await sharp(png).composite([{ input: guide }]).png().toBuffer();
  const guided = await sharp(guidedFull).resize(1100, dH).png().toBuffer();
  const frame = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${PH}">
    <rect width="${PW}" height="${PH}" fill="#E9E7E1"/>
    ${T(`${id === "popbeez" ? "PopBeez" : "NusaBeez"} — Facebook Page cover · 1640×624`, 60, 70, 30, BOLD, "#16181D")}
    ${T("Pratinjau desktop (atas), crop HP (kanan), dan panduan area aman (bawah).", 60, 108, 18, MED, "#5C6068")}
    <rect x="60" y="140" width="${dW}" height="${dH + 150}" rx="18" fill="#FFFFFF"/>
    ${T(id === "popbeez" ? "PopBeez" : "NusaBeez", 300, 140 + dH + 58, 34, BOLD, "#16181D")}
    ${T("Halaman · Media/berita", 300, 140 + dH + 88, 18, MED, "#6B6F77")}
    <rect x="1230" y="140" width="${560}" height="${Math.round((520 * H) / mCropW) + 120}" rx="34" fill="#16181D"/>
    ${T("HP · crop 16:9", 1262, 186, 18, BOLD, "#FFFFFF")}
    ${T("Area aman HP (biru putus-putus)", 60, 140 + dH + 150 + 60, 18, BOLD, "#0E7490")}
    ${T("Area foto profil desktop (kotak putih) — dibiarkan kosong", 470, 140 + dH + 150 + 60, 18, BOLD, "#3F434B")}
  </svg>`);
  await sharp(frame)
    .composite([
      { input: desktop, left: 60, top: 140 },
      {
        input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><circle cx="100" cy="100" r="96" fill="#FFFFFF"/><circle cx="100" cy="100" r="88" fill="#0C0910"/><circle cx="100" cy="100" r="78" fill="${BRAND_COLOR[id]}" fill-opacity="0.16"/>${mark(id, BRAND_COLOR[id], 50, 50, 100)}</svg>`),
        left: 90,
        top: 140 + dH - 90,
      },
      { input: mobile, left: 1250, top: 210 },
      { input: guided, left: 60, top: 140 + dH + 150 + 80 },
    ])
    .png()
    .toFile(path.join(out, `${id}-preview.png`));
}

const sizes = [];
for (const f of (await fs.readdir(out)).sort()) sizes.push(`${f}  ${((await fs.stat(path.join(out, f))).size / 1024).toFixed(0)} KB`);
console.log(sizes.join("\n"));
