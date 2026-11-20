import fs from 'node:fs/promises';
import path from 'node:path';
import opentype from 'opentype.js';
import sharp from 'sharp';
import { LOGO_BRANDS } from '../src/lib/logo-concepts.ts';

// Run: node --experimental-strip-types scripts/build-logos.mjs
const root = process.cwd();
const output = path.join(root, 'public/logos');
await fs.mkdir(output, { recursive: true });
const fontBytes = await fs.readFile(path.join(root, 'scripts/assets/SpaceGrotesk-Bold.ttf'));
const font = opentype.parse(fontBytes.buffer.slice(fontBytes.byteOffset, fontBytes.byteOffset + fontBytes.byteLength));
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const pathData = (commands) => commands.map((c) => {
  const n = (k) => { if (!Number.isFinite(c[k])) throw new Error(`Invalid glyph coordinate: ${k}`); return c[k].toFixed(2); };
  switch (c.type) {
    case 'M': case 'L': return `${c.type}${n('x')} ${n('y')}`;
    case 'Q': return `Q${n('x1')} ${n('y1')} ${n('x')} ${n('y')}`;
    case 'C': return `C${n('x1')} ${n('y1')} ${n('x2')} ${n('y2')} ${n('x')} ${n('y')}`;
    case 'Z': return 'Z';
    default: throw new Error(`Unsupported glyph command: ${c.type}`);
  }
}).join(' ');
const text = (s, x, y, size, color) => `<path fill="${color}" d="${pathData(font.getPath(s, x, y, size).commands)}"/>`;
const centerText = (s, cx, y, size, color) => text(s, cx - font.getAdvanceWidth(s, size) / 2, y, size, color);
const svg = (w, h, body, title = 'HiveComp logo concept') => `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${body}</svg>`;
const mark = (concept, color, x = 0, y = 0, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})" color="${color}">${concept.shape}</g>`;

for (const brand of LOGO_BRANDS) {
  for (const concept of brand.concepts) {
    const title = `${brand.name} — ${concept.title} / Concept ${concept.code}`;
    const makeLogo = (dark = false, mono = false) => {
      const size = brand.name.length > 9 ? 47 : 52;
      const color = mono ? '#151712' : brand.color;
      const ink = dark ? '#F6F3EB' : '#151712';
      const word = text(brand.name, 165, 112, size, ink);
      const sub = text(brand.category.toUpperCase(), 168, 143, 10, dark ? '#A5A69D' : '#777A70');
      return svg(580, 204, `${mark(concept, color, 14, 38, 1)}${word}${sub}`, title);
    };
    const markSvg = svg(160, 160, mark(concept, brand.color, 16, 16, 1), title);
    const monoSvg = svg(160, 160, mark(concept, '#151712', 16, 16, 1), title);
    await Promise.all([
      fs.writeFile(path.join(output, `${concept.id}-mark.svg`), markSvg),
      fs.writeFile(path.join(output, `${concept.id}-logo.svg`), makeLogo(false)),
      fs.writeFile(path.join(output, `${concept.id}-logo-dark.svg`), makeLogo(true)),
      fs.writeFile(path.join(output, `${concept.id}-mono.svg`), monoSvg),
      sharp(Buffer.from(markSvg)).resize(1024, 1024).png().toFile(path.join(output, `${concept.id}-mark.png`)),
      sharp(Buffer.from(makeLogo(false))).resize(1740, 612).png().toFile(path.join(output, `${concept.id}-logo.png`)),
    ]);
  }
}

// One presentation board per brand: 3 genuinely different designs, not colorways.
for (const brand of LOGO_BRANDS) {
  const paper = '#F2F0E8';
  const ink = '#151712';
  let body = `<rect width="1600" height="1040" fill="#0C0E0A"/>`;
  body += text('HIVECOMP / BRAND STUDIO', 65, 52, 15, '#FFB000');
  body += text(brand.name, 65, 126, 61, '#F2F0E8');
  body += text('03 ARAH IDENTITAS / KONSEP UNTUK DIDISKUSIKAN', 67, 169, 14, '#909486');
  body += text('SIMBOL + WORDMARK + UJI SATU WARNA', 65, 973, 13, '#929587');
  body += text('Belum merupakan hasil pemeriksaan merek dagang.', 65, 1005, 12, '#666D5E');
  brand.concepts.forEach((c, i) => {
    const x = 65 + i * 500;
    body += `<rect x="${x}" y="218" width="470" height="687" rx="22" fill="${paper}"/>`;
    body += text(c.code, x + 28, 260, 13, '#7B7E71');
    if (c.recommended) {
      body += `<rect x="${x + 299}" y="239" width="144" height="28" rx="14" fill="#E1DFC9"/>`;
      body += text('REKOMENDASI', x + 316, 258, 10, '#555939');
    }
    body += mark(c, brand.color, x + 136, 321, 1.55);
    body += centerText(brand.name, x + 235, 595, 42, ink);
    body += `<line x1="${x + 28}" y1="643" x2="${x + 442}" y2="643" stroke="#D8D7CB"/>`;
    body += text(c.title, x + 28, 690, 25, ink);
    body += text(c.direction, x + 28, 720, 12, '#797C6E');
    body += mark(c, '#151712', x + 27, 763, 0.63);
    body += `<rect x="${x + 142}" y="758" width="94" height="100" rx="12" fill="#151712"/>`;
    body += mark(c, '#F2F0E8', x + 150, 769, 0.61);
    body += text('32 PX', x + 278, 780, 10, '#8C8E82');
    body += mark(c, brand.darkColor, x + 278, 799, 0.25);
    body += text('VECTOR', x + 345, 823, 10, '#8C8E82');
  });
  const board = svg(1600, 1040, body, `${brand.name}: tiga rekomendasi logo`);
  await fs.writeFile(path.join(output, `${brand.id}-board.svg`), board);
  await sharp(Buffer.from(board)).png().toFile(path.join(output, `${brand.id}-board.png`));
}

// Combined poster (all 18 concepts).
let poster = `<rect width="1600" height="2300" fill="#F2F0E8"/>`;
poster += text('HIVECOMP / BRAND STUDIO', 65, 70, 18, '#9C6A08');
poster += text('Enam nama. Delapan belas arah.', 65, 145, 48, '#151712');
poster += text('Pilihan konsep orisinal untuk didiskusikan — bukan keputusan identitas final.', 65, 186, 16, '#74786A');
LOGO_BRANDS.forEach((b, row) => {
  const y = 240 + row * 330;
  poster += `<line x1="65" y1="${y}" x2="1535" y2="${y}" stroke="#D6D7CA"/>`;
  poster += text(b.name.toUpperCase(), 65, y + 32, 14, '#676C5E');
  b.concepts.forEach((c, col) => {
    const x = 65 + col * 500;
    poster += mark(c, b.color, x + 180, y + 53, 0.93);
    poster += centerText(b.name, x + 235, y + 223, 29, '#151712');
    poster += centerText(`${c.code} / ${c.title}${c.recommended ? ' *' : ''}`, x + 235, y + 254, 13, '#7B8072');
  });
});
poster += text('* Pilihan yang saya rekomendasikan. Uji kemiripan merek sebelum dipakai final.', 65, 2260, 14, '#7B8072');
await fs.writeFile(path.join(output, 'all-concepts.svg'), svg(1600, 2300, poster));
await sharp(Buffer.from(svg(1600, 2300, poster))).png().toFile(path.join(output, 'all-concepts.png'));
await fs.copyFile(path.join(root, 'scripts/assets/OFL-Space-Grotesk.txt'), path.join(output, 'OFL-Space-Grotesk.txt'));
await fs.writeFile(path.join(output, 'BACA-DULU.txt'), [
  'HiveComp — 18 Konsep Logo / Brand Studio',
  '',
  '6 brand × 3 arah desain. Pilihan konsep bukan klaim pendaftaran merek.',
  'Semua simbol dibuat khusus dengan geometri SVG; bukan ikon platform pihak ketiga.',
  'Wordmark memakai Space Grotesk Bold berlisensi SIL OFL; teks SVG sudah menjadi outline.',
  'MARK: simbol saja, latar transparan (SVG / PNG 1024px).',
  'LOGO: simbol + wordmark untuk latar terang (SVG / PNG 1740px).',
  'LOGO-DARK: simbol + wordmark untuk latar gelap (SVG).',
  'MONO: simbol satu warna (SVG).',
  'BOARD: tiga opsi per brand (SVG / PNG).',
  '',
  'Sebelum final: cek kemiripan merek, uji ukuran kecil, dan setujui ejaan/warna.',
  'Memilih di Studio tidak mengganti situs. Penerapan memerlukan login admin dan tombol konfirmasi.',
  '',
  ...LOGO_BRANDS.flatMap((b) => [b.name, ...b.concepts.map((c) => `  ${c.code} ${c.title}${c.recommended ? ' — rekomendasi' : ''}: ${c.description}`), '']),
].join('\n'));
console.log(`Generated ${LOGO_BRANDS.reduce((n, b) => n + b.concepts.length, 0)} concepts with outlined typography, SVGs, transparent PNGs, and 7 presentation boards.`);
