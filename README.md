# HiveComp — Ekosistem Media & Commerce

## Studio Logo — 18 Konsep

Buka `/studio-logo` melalui footer atau tombol **Studio Logo** di admin.
Tersedia 3 arah untuk HiveComp dan masing-masing dari lima brand, perbandingan
terang/gelap/monokrom, uji ukuran kecil, dan unduhan SVG/PNG.
Paket lengkap: `/logos/hivecomp-18-logo-concepts.zip`.
Panduan desain: [`LOGO-CONCEPTS.md`](./LOGO-CONCEPTS.md).

Shortlist tersimpan lokal tanpa login, atau di PostgreSQL untuk admin.
**Memilih tidak otomatis mengganti logo.** Penerapan ke landing page memerlukan
login admin dan konfirmasi terpisah. Konsep belum melalui pemeriksaan merek.

Pilihan final pemilik yang menjadi logo bawaan: HiveComp 01 Colony,
PopBeez 01 Pop Talk, NusaBeez 01 Headline N, BlinkBeez 01 Flash Play,
E-Beez 03 Market Wings, dan Portal-Hub 01 Gateway.


Landing page + panel admin + halaman brand + demo Portal-Hub untuk ekosistem
HiveComp (PopBeez, NusaBeez, Portal-Hub, BlinkBeez, E-Beez).

## Rute

| Rute          | Fungsi                                                        |
| ------------- | ------------------------------------------------------------- |
| `/`           | Landing page utama (teks & URL dikontrol dari panel admin)     |
| `/popbeez`    | Halaman brand PopBeez — news card hiburan dari Portal-Hub      |
| `/nusabeez`   | Halaman brand NusaBeez — news card nasional dari Portal-Hub    |
| `/blinkbeez`  | Halaman brand BlinkBeez — mockup YouTube Shorts                |
| `/e-beez`     | Halaman prototipe brand E-Beez — contoh katalog produk UMKM   |
| `/portal-hub` | Demo aggregator berita bergaya MSN/Yahoo (cari + filter)       |
| `/media-kit`  | Media Kit resmi & profil kemitraan (siap cetak / simpan PDF)   |
| `/kebijakan`  | Satu halaman Privasi & Disclaimer, dengan tautan per bagian    |
| `/kontak`     | Mengarah ke formulir `/#kontak` di landing page                |
| `/privasi`, `/disclaimer` | Mengarah ke bagian terkait di `/kebijakan`        |
| `/admin`      | Panel admin: checklist rilis, tampilan, logo, URL, ekspor CSV & balas WhatsApp |
| `/api/showcase` | Konektor server-side untuk panel Showcase (cache 5 menit)    |
| `/sitemap.xml` & `/robots.txt` | Peta situs & aturan perayapan mesin pencari |

## Susunan landing page

`Hero → Ticker brand → Ekosistem → Showcase → Jaringan Brand → Mitra → Target → Kontak → Footer`

Elemen krom: progress bar gulir, rail navigasi section (desktop), smooth scroll
Lenis, skip-link, fokus keyboard, `prefers-reduced-motion`, dan JSON-LD
Organization. Nomor section konsisten `(01)–(06)`.

Panel **Sebelum Rilis** di `/admin` menghitung dari database + env apa yang
masih berupa placeholder (password, kontak, URL brand, angka target,
konektor). Tidak ada data kontak rekaan yang tampil publik: kolom kosong
otomatis disembunyikan dan formulir menjadi jalur utama.

## Keputusan desain: satu landing page + CTA

Berdasarkan konsultasi, struktur yang dipilih adalah **Opsi B**: seluruh brand
ditampilkan dalam satu landing page, dengan section **Showcase** (PopBeez,
NusaBeez, BlinkBeez) dan CTA langsung ke produk nyata (E-Beez dan
`www.portal-hub.online`). Tidak ada dashboard showcase per subdomain.

**Prinsip data:** panel Showcase hanya menampilkan data ASLI. Tanpa konektor
yang dikonfigurasi, yang muncul adalah status "belum terhubung" plus tombol
CTA — tidak ada angka rekaan. Kredensial opsional (lihat `.env.example`):
`META_PAGE_TOKEN`, `META_PAGE_ID_POPBEEZ`, `META_PAGE_ID_NUSABEEZ`,
`YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID_BLINKBEEZ`.

> Catatan: Portal-Hub **bukan** sumber news card PopBeez/NusaBeez. Halaman
> `/portal-hub` dan `/[brand]` di repo ini adalah prototipe, bukan sistem
> produksi Anda.

## Panel Admin

- Buka `/admin`. Password default: `hive-admin`.
- **Wajib ganti di production**: set environment variable `ADMIN_PASSWORD`.
- Tab **Tampilan & URL**: ubah teks hero, URL PopBeez/NusaBeez/dll, kontak,
  media sosial, dan angka target. Perubahan langsung tampil di situs.
- Tab **Berita Portal-Hub**: terbitkan/hapus berita. Kategori **Nasional**
  otomatis menjadi news card NusaBeez, **Hiburan** menjadi news card PopBeez
  (flywheel konten).
- Tab **Pesan Masuk**: semua kiriman formulir kerja sama & newsletter.

## Deploy ke Vercel lewat GitHub

📄 **Panduan langkah demi langkah ada di [`DEPLOY.md`](./DEPLOY.md).**

Ringkasnya: `git push` → Import repo di vercel.com → **Storage → Create
Postgres** → set `ADMIN_PASSWORD` → **Deploy**.

**Zero-config database:** tabel (`leads`, `settings`, `articles`) dan 13 berita
demo Portal-Hub dibuat otomatis pada request pertama lewat `src/db/ensure.ts`.
Tidak perlu `drizzle-kit push` atau `psql` di Vercel. Koneksi dibuat *lazy*,
sehingga build tetap sukses walau env database belum di-attach.

`DATABASE_URL` / `POSTGRES_URL` dibaca otomatis dari integrasi Vercel Postgres
(Neon). Integrasi Marketplace kerap memberi **prefix nama database** pada
variabelnya (`HIVE_DATABASE_URL`, `HIVE_POSTGRES_URL`, `_UNPOOLED`, dst.), jadi
`resolveDatabaseUrl()` di `src/db/index.ts` juga memindai nama berakhiran
`_DATABASE_URL` / `_POSTGRES_URL` dan mengutamakan yang **pooled**. Pool dibatasi
`max: 3` + dukungan SSL untuk serverless. Cek kesiapan di `/api/health` —
responsnya menyertakan `database` (`ready` / `not_configured` / `error`),
`envKey` (variabel mana yang dipakai), dan `error` bila koneksi gagal.

## Pengembangan Lokal

```bash
npm install
# .env berisi DATABASE_URL lokal
npx drizzle-kit push
psql "$DATABASE_URL" -f seed.sql   # opsional
npm run dev
```

Stack: Next.js (App Router) · Drizzle ORM · PostgreSQL · Tailwind CSS v4 ·
Framer Motion · Lenis.
