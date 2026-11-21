import fs from "node:fs/promises";
import path from "node:path";
import opentype from "opentype.js";
import sharp from "sharp";
import { LOGO_BRANDS, SELECTED_LOGOS } from "../src/lib/logo-concepts.ts";

// Run: node --experimental-strip-types scripts/build-fb-profiles.mjs
// Facebook profile photo: upload square 1:1; displayed as a circle
// (170px desktop / 128px mobile / ~36px in comments). Design 1080×1080 and keep
// every important element inside the inscribed circle (radius 540) with margin.

const S = 1080;
const root = process.cwd();
const out = path.join(root, "public/profil");
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

function textD(str, x, y, size, font, tracking = 0) {
  if (!tracking) return { d: pathData(font.getPath(str, x, y, size).commands), width: font.getAdvanceWidth(str, size) };
  let cx = x;
  const parts = [];
  for (const ch of str) {
    const g = font.charToGlyph(ch);
    parts.push(pathData(g.getPath(cx, y, size).commands));
    cx += (g.advanceWidth * size) / font.unitsPerEm + tracking;
  }
  return { d: parts.join(" "), width: cx - x - tracking };
}
const T = (str, x, y, size, font, fill, tracking = 0) =>
  `<path fill="${fill}" d="${textD(str, x, y, size, font, tracking).d}"/>`;

const shapeOf = (brandId) => {
  const brand = LOGO_BRANDS.find((b) => b.id === brandId);
  return brand.concepts.find((c) => c.id === SELECTED_LOGOS[brandId]).shape;
};
const mark = (brandId, color, x, y, size) =>
  `<g transform="translate(${x} ${y}) scale(${size / 128})" color="${color}">${shapeOf(brandId)}</g>`;

const sparkle = (cx, cy, r, fill, op = 1) =>
  `<path fill="${fill}" opacity="${op}" d="M${cx} ${cy - r}C${cx + r * 0.16} ${cy - r * 0.16} ${cx + r * 0.16} ${cy - r * 0.16} ${cx + r} ${cy}C${cx + r * 0.16} ${cy + r * 0.16} ${cx + r * 0.16} ${cy + r * 0.16} ${cx} ${cy + r}C${cx - r * 0.16} ${cy + r * 0.16} ${cx - r * 0.16} ${cy + r * 0.16} ${cx - r} ${cy}C${cx - r * 0.16} ${cy - r * 0.16} ${cx - r * 0.16} ${cy - r * 0.16} ${cx} ${cy - r}Z"/>`;

const DOTS = `<pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.8" fill="#FFFFFF" fill-opacity="0.08"/></pattern>`;
const GLOW = `<filter id="gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="42"/></filter>`;
const SHADOW = `<filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="16"/><feOffset dy="14"/><feComponentTransfer><feFuncA type="linear" slope="0.42"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
const radial = (id, cx, cy, r, color, op) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${color}" stop-opacity="${op}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
const full = (fill) => `<rect width="${S}" height="${S}" fill="${fill}"/>`;

const BR = {
  popbeez: { name: "PopBeez", color: "#F54B8D", violet: "#8B5CF6" },
  nusabeez: { name: "NusaBeez", color: "#EF4B42" },
};

/* ---- logo sizing from the REAL glyph bounds (not the padded 128 grid) ---- */
async function bbox(brandId) {
  const N = 640;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${N}" height="${N}" viewBox="0 0 128 128"><g color="#000000">${shapeOf(brandId)}</g></svg>`;
  const { data, info } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width, minY = info.height, maxX = -1, maxY = -1, sum = 0, sx = 0, sy = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const a = data[(y * info.width + x) * info.channels + 3];
      if (a > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
      sum += a;
      sx += a * x;
      sy += a * y;
    }
  }
  const k = 128 / N;
  return { x: minX * k, y: minY * k, w: (maxX - minX + 1) * k, h: (maxY - minY + 1) * k, mx: (sx / sum) * k, my: (sy / sum) * k };
}
const BBOX = { popbeez: await bbox("popbeez"), nusabeez: await bbox("nusabeez") };
/** Logo scaled so its larger side = `target` px, centred on (cx, cy). */
const markFit = (brandId, color, cx, cy, target) => {
  const b = BBOX[brandId];
  const k = target / Math.max(b.w, b.h);
  // Optical centring: blend bounding-box centre and centre of mass. The pointed
  // speech-bubble tail inflates the bounding box downward, so vertical correction
  // is kept gentle (0.35) while horizontal correction is strong (0.85).
  const ox = b.x + b.w / 2 + (b.mx - (b.x + b.w / 2)) * 0.85;
  const oy = b.y + b.h / 2 + (b.my - (b.y + b.h / 2)) * 0.35;
  return `<g transform="translate(${(cx - ox * k).toFixed(2)} ${(cy - oy * k).toFixed(2)}) scale(${k.toFixed(4)})" color="${color}">${shapeOf(brandId)}</g>`;
};

/* ================================ POPBEEZ ================================ */
function popA() {
  const P = BR.popbeez.color, V = BR.popbeez.violet;
  let s = `<defs>${radial("tl", 150, 120, 540, P, 0.10)}${radial("br", 940, 980, 540, V, 0.07)}<pattern id="dotsP" width="30" height="30" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.8" fill="${P}" fill-opacity="0.12"/></pattern></defs>`;
  s += full("#FFFFFF") + full("url(#tl)") + full("url(#br)") + full("url(#dotsP)");
  s += `<circle cx="540" cy="540" r="486" fill="none" stroke="${P}" stroke-width="10"/><circle cx="540" cy="540" r="438" fill="none" stroke="${P}" stroke-opacity="0.16" stroke-width="2"/>`;
  s += markFit("popbeez", P, 540, 540, 610);
  return s;
}
function popB() {
  const P = BR.popbeez.color, V = BR.popbeez.violet;
  let s = `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF7AB0"/><stop offset="0.5" stop-color="${P}"/><stop offset="1" stop-color="${V}"/></linearGradient>${radial("hi", 300, 230, 560, "#FFFFFF", 0.26)}${SHADOW}</defs>`;
  s += full("url(#bg)") + full("url(#hi)");
  s += `<circle cx="540" cy="540" r="486" fill="none" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="6"/>`;
  s += `<g filter="url(#sh)">${markFit("popbeez", "#FFFFFF", 540, 540, 610)}</g>`;
  s += sparkle(862, 266, 22, "#FFFFFF", 0.95) + sparkle(222, 820, 14, "#FFFFFF", 0.8);
  return s;
}
function popC() {
  const P = BR.popbeez.color, V = BR.popbeez.violet;
  let s = `<defs>${radial("g1", 540, 540, 540, P, 0.30)}<linearGradient id="cardg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P}"/><stop offset="1" stop-color="${V}"/></linearGradient><linearGradient id="cardb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2A1424"/><stop offset="1" stop-color="#170E1B"/></linearGradient>${DOTS}${SHADOW}</defs>`;
  s += full("#130A14") + full("url(#g1)") + full("url(#dots)");
  s += `<g transform="translate(540 540) rotate(14)" filter="url(#sh)"><rect x="-300" y="-300" width="600" height="600" rx="140" fill="url(#cardb)" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="3"/></g>`;
  s += `<g transform="translate(540 540) rotate(-8)" filter="url(#sh)"><rect x="-300" y="-300" width="600" height="600" rx="140" fill="url(#cardg)"/>${markFit("popbeez", "#FFFFFF", 0, 0, 390)}</g>`;
  return s;
}

/* =============================== NUSABEEZ =============================== */
function nusaA() {
  const R = BR.nusabeez.color;
  let s = `<defs>${radial("g1", 540, 540, 540, R, 0.30)}</defs>`;
  s += full("#0A0D14") + full("url(#g1)");
  for (let x = 0; x <= S; x += 90) s += `<rect x="${x}" y="0" width="1" height="${S}" fill="#FFFFFF" fill-opacity="0.05"/>`;
  for (const y of [135, 945]) s += `<rect x="0" y="${y}" width="${S}" height="1" fill="#FFFFFF" fill-opacity="0.09"/>`;
  s += `<circle cx="540" cy="540" r="486" fill="none" stroke="${R}" stroke-width="10"/><circle cx="540" cy="540" r="438" fill="none" stroke="#FFFFFF" stroke-opacity="0.08" stroke-width="2"/>`;
  s += markFit("nusabeez", R, 540, 540, 590);
  return s;
}
function nusaB() {
  const R = BR.nusabeez.color;
  let s = `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF7A70"/><stop offset="0.5" stop-color="${R}"/><stop offset="1" stop-color="#A8221C"/></linearGradient>${radial("hi", 300, 220, 560, "#FFFFFF", 0.24)}${SHADOW}</defs>`;
  s += full("url(#bg)") + full("url(#hi)");
  for (let x = 0; x <= S; x += 90) s += `<rect x="${x}" y="0" width="1" height="${S}" fill="#FFFFFF" fill-opacity="0.08"/>`;
  s += `<circle cx="540" cy="540" r="486" fill="none" stroke="#FFFFFF" stroke-opacity="0.4" stroke-width="6"/>`;
  s += `<g filter="url(#sh)">${markFit("nusabeez", "#FFFFFF", 540, 540, 600)}</g>`;
  return s;
}
function nusaC() {
  const R = BR.nusabeez.color;
  let s = `<defs>${radial("g1", 540, 540, 540, R, 0.30)}<clipPath id="pc"><rect x="-260" y="-300" width="520" height="600" rx="40"/></clipPath>${SHADOW}</defs>`;
  s += full("#0A0D14") + full("url(#g1)");
  for (let x = 0; x <= S; x += 90) s += `<rect x="${x}" y="0" width="1" height="${S}" fill="#FFFFFF" fill-opacity="0.05"/>`;
  s += `<g transform="translate(540 540) rotate(10)" filter="url(#sh)"><rect x="-260" y="-300" width="520" height="600" rx="40" fill="#1A1F2B" stroke="#FFFFFF" stroke-opacity="0.16" stroke-width="3"/><rect x="-200" y="-216" width="400" height="22" rx="8" fill="#FFFFFF" fill-opacity="0.12"/><rect x="-200" y="-176" width="270" height="14" rx="7" fill="#FFFFFF" fill-opacity="0.08"/></g>`;
  s += `<g transform="translate(540 540) rotate(-5)" filter="url(#sh)"><rect x="-260" y="-300" width="520" height="600" rx="40" fill="#F3EFE6"/><g clip-path="url(#pc)"><rect x="-260" y="-300" width="520" height="90" fill="${R}"/></g><circle cx="-214" cy="-255" r="10" fill="#FFFFFF"/><rect x="-186" y="-264" width="160" height="18" rx="9" fill="#FFFFFF" fill-opacity="0.9"/>${markFit("nusabeez", R, 0, 12, 350)}<rect x="-185" y="206" width="370" height="18" rx="9" fill="#141821"/><rect x="-185" y="240" width="250" height="18" rx="9" fill="#141821" fill-opacity="0.35"/></g>`;
  return s;
}

const VARIANTS = {
  popbeez: [
    { id: "a-white", name: "Pop White", note: "Latar putih, logo pink — bersih dan kontras.", fn: popA },
    { id: "b-solid", name: "Pop Solid", note: "Warna penuh pink-ungu, tegas di ukuran kecil.", fn: popB },
    { id: "c-cardstack", name: "Card Stack", note: "Kartu miring seperti di banner, logo putih.", fn: popC },
  ],
  nusabeez: [
    { id: "a-headline", name: "Headline Glow", note: "Latar gelap & cincin merah, senada dengan banner.", fn: nusaA },
    { id: "b-solid", name: "Solid Red", note: "Merah penuh, logo putih — tegas di ukuran kecil.", fn: nusaB },
    { id: "c-frontpage", name: "Front Page", note: "Lembar koran krem di atas kartu gelap.", fn: nusaC },
  ],
};
const REC = { popbeez: "a-white", nusabeez: "b-solid" };

const svgDoc = (body, title) =>
  `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>`;

async function circ(buf, d) {
  return sharp(buf)
    .resize(d, d)
    .ensureAlpha()
    .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${d}" height="${d}"><circle cx="${d / 2}" cy="${d / 2}" r="${d / 2}" fill="#fff"/></svg>`), blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function board(id, rendered) {
  const b = BR[id];
  const PW = 1800, PH = 1470;
  const top = 150, cardW = 540, cardH = 620, xs = [60, 630, 1200];
  const recId = REC[id];
  const recLetter = String.fromCharCode(65 + VARIANTS[id].findIndex((v) => v.id === recId));
  let svg = `<rect width="${PW}" height="${PH}" fill="#E9E7E1"/>`;
  svg += T(`${b.name} — Foto profil Facebook`, 60, 74, 34, BOLD, "#16181D");
  svg += T("Tiga arah desain. Unggah persegi 1080×1080; Facebook memotongnya menjadi lingkaran.", 60, 112, 18, MED, "#5C6068");
  const comps = [];
  for (let i = 0; i < rendered.length; i++) {
    const { v, png } = rendered[i];
    const x = xs[i];
    svg += `<rect x="${x}" y="${top}" width="${cardW}" height="${cardH}" rx="26" fill="#FFFFFF"/>`;
    if (v.id === recId) {
      svg += `<rect x="${x + cardW - 176}" y="${top + 22}" width="152" height="30" rx="15" fill="${b.color}"/>` + T("REKOMENDASI", x + cardW - 160, top + 42, 12, BOLD, "#FFFFFF", 1.6);
    }
    svg += `<circle cx="${x + 270}" cy="${top + 205}" r="167" fill="none" stroke="#000000" stroke-opacity="0.10" stroke-width="2"/>`;
    svg += T(`${String.fromCharCode(65 + i)} · ${v.name}`, x + 36, top + 420, 28, BOLD, "#16181D");
    svg += T(v.note, x + 36, top + 452, 14, MED, "#6B6F77");
    const cy = top + 520;
    const smalls = [[110, 96, "Profil"], [270, 56, "Komentar"], [400, 36, "Notifikasi"]];
    for (const [dx, d, label] of smalls) {
      svg += T(label, x + dx - textD(label, 0, 0, 12, MED).width / 2, top + 590, 12, MED, "#8A8E96");
    }
    comps.push({ input: await circ(png, 330), left: x + 270 - 165, top: top + 40 });
    for (const [dx, d] of smalls) comps.push({ input: await circ(png, d), left: x + dx - d / 2, top: cy - d / 2 });
  }

  // ---- context: Page header over the real cover + a feed post ----
  const ctxTop = 850;
  svg += T(`Tampil di halaman Facebook · varian ${recLetter}`, 60, 830, 20, BOLD, "#16181D");
  svg += T("Tampil di feed · varian " + recLetter, 1200, 830, 20, BOLD, "#16181D");
  const cw = 1100;
  const chh = Math.round((cw * 624) / 1640);
  const panelH = chh + 160;
  svg += `<rect x="60" y="${ctxTop}" width="${cw}" height="${panelH}" rx="20" fill="#FFFFFF"/>`;
  svg += T(b.name, 330, ctxTop + chh + 86, 40, BOLD, "#16181D");
  svg += T("Halaman · Media/berita", 330, ctxTop + chh + 120, 18, MED, "#6B6F77");
  svg += `<rect x="${60 + cw - 160}" y="${ctxTop + chh + 58}" width="124" height="46" rx="10" fill="${b.color}"/>` + T("Ikuti", 60 + cw - 160 + 62 - textD("Ikuti", 0, 0, 19, BOLD).width / 2, ctxTop + chh + 88, 19, BOLD, "#FFFFFF");

  svg += `<rect x="1200" y="${ctxTop}" width="540" height="${panelH}" rx="20" fill="#FFFFFF"/>`;
  svg += T(b.name, 1324, ctxTop + 52, 24, BOLD, "#16181D");
  svg += T("2 jam · Publik", 1324, ctxTop + 80, 15, MED, "#8A8E96");
  svg += `<rect x="1232" y="${ctxTop + 124}" width="470" height="14" rx="7" fill="#16181D" fill-opacity="0.85"/><rect x="1232" y="${ctxTop + 152}" width="340" height="14" rx="7" fill="#16181D" fill-opacity="0.35"/>`;
  svg += `<rect x="1232" y="${ctxTop + 196}" width="476" height="260" rx="14" fill="${b.color}" fill-opacity="0.12"/>` + markFit(id, b.color, 1470, ctxTop + 326, 150);
  svg += `<rect x="1232" y="${ctxTop + 490}" width="476" height="1.5" fill="#000000" fill-opacity="0.08"/>` + [0, 1, 2].map((k) => `<circle cx="${1244 + k * 34}" cy="${ctxTop + 522}" r="9" fill="#16181D" fill-opacity="0.2"/>`).join("");

  const coverBuf = await fs.readFile(path.join(root, "public/covers", `${id}-facebook-cover.png`));
  const roundTop = await sharp(coverBuf)
    .resize(cw, chh)
    .extend({ bottom: 40, background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .ensureAlpha()
    .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${chh + 40}"><rect width="${cw}" height="${chh + 40}" rx="20" fill="#fff"/></svg>`), blend: "dest-in" }])
    .png()
    .toBuffer();
  const rec = rendered.find((r) => r.v.id === recId).png;
  comps.push({ input: roundTop, left: 60, top: ctxTop });
  comps.push({ input: await circ(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="216" height="216"><circle cx="108" cy="108" r="108" fill="#fff"/></svg>`), 216), left: 92, top: ctxTop + chh - 108 });
  comps.push({ input: await circ(rec, 200), left: 100, top: ctxTop + chh - 100 });
  comps.push({ input: await circ(rec, 76), left: 1232, top: ctxTop + 30 });

  const base = `<svg xmlns="http://www.w3.org/2000/svg" width="${PW}" height="${PH}" viewBox="0 0 ${PW} ${PH}">${svg}</svg>`;
  await sharp(Buffer.from(base)).composite(comps).png().toFile(path.join(out, `${id}-profil-pilihan.png`));
}

for (const id of Object.keys(VARIANTS)) {
  const rendered = [];
  for (const v of VARIANTS[id]) {
    const svg = svgDoc(v.fn(), `${BR[id].name} — foto profil ${v.name}`);
    if (/NaN|undefined/.test(svg)) throw new Error(`${id}/${v.id}: invalid SVG`);
    const base = path.join(out, `${id}-profil-${v.id}`);
    await fs.writeFile(`${base}.svg`, svg);
    const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
    await fs.writeFile(`${base}.png`, png);
    rendered.push({ v, png });
  }
  await board(id, rendered);
}

const rows = [];
for (const f of (await fs.readdir(out)).sort()) rows.push(`${f}  ${((await fs.stat(path.join(out, f))).size / 1024).toFixed(0)} KB`);
console.log(rows.join("\n"));
