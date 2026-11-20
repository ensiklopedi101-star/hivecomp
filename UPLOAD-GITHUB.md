# 📦 Upload ke GitHub lalu Deploy ke Vercel

Paket siap upload: **`hivecomp-github-vercel.zip`**.
Ekstrak dulu — di dalamnya ada satu folder bernama `hivecomp/` berisi seluruh kode.

> Repo ini punya **203 berkas** (125 di antaranya aset logo di `public/logos`).
> Upload web GitHub dibatasi **100 berkas per commit**, jadi pilih salah satu
> cara di bawah. Cara A paling ringan, cara B tanpa aplikasi tambahan.

---

## Cara A — GitHub Desktop (disarankan, tanpa terminal)

1. Ekstrak `hivecomp-github-vercel.zip`.
2. Buat repo baru di **github.com/new** — kosong, **tanpa** README/.gitignore.
3. Buka **GitHub Desktop** → `File` → `Clone Repository` → pilih repo Anda,
   simpan di folder kosong.
4. Salin **seluruh isi** folder `hivecomp/` ke dalam folder repo tersebut.
5. Di GitHub Desktop akan muncul ±203 perubahan → tulis pesan commit
   (contoh: `HiveComp initial release`) → **Commit to main** → **Publish repository**.

## Cara B — Upload web GitHub (3 batch)

1. Ekstrak ZIP. Buka `github.com/USERNAME/REPO` → **Add file → Upload files**.
2. Masukkan berkas dengan urutan ini (masih di halaman upload yang sama, boleh
   langsung commit setelah ketiganya masuk, atau commit per batch):

   | Batch | Isi folder | Jumlah |
   | --- | --- | --- |
   | 1 | semua berkas & folder **di luar** `public/` (`src`, `scripts`, `next.config.ts`, `package.json`, `.env.example`, `.gitignore`, `README.md`, `DEPLOY.md`, `LOGO-CONCEPTS.md`, `.github`, dll.) | ±78 |
   | 2 | separuh pertama isi `public/logos` | ±63 |
   | 3 | separuh berikutnya `public/logos` | ±62 |

   GitHub menjaga struktur folder saat Anda menyeret folder, jadi `src/app/…`
   akan tetap berada di jalur yang benar.
3. Tulis pesan commit → **Commit changes**.

> Batas web GitHub: 100 berkas/commit, 25 MB per berkas. Karena itulah
> `public/logos` dibagi dua. Ukuran total paket hanya ±2 MB, jadi aman.

## Cara C — Terminal (paling cepat)

```bash
git clone https://github.com/USERNAME/hivecomp.git
cd hivecomp
# salin seluruh isi folder hivecomp hasil ekstrak ke dalam folder ini
git add .
git commit -m "HiveComp initial release"
git push origin main
```

---

## Deploy ke Vercel

1. **vercel.com/new** → pilih repo `hivecomp` → **Import**.
   Framework otomatis terdeteksi Next.js — biarkan Build Command default.
2. **Storage → Create Database → Postgres (Neon)**.
   `DATABASE_URL` / `POSTGRES_URL` ter-inject otomatis; aplikasi membaca keduanya.
3. **Settings → Environment Variables** → tambahkan `ADMIN_PASSWORD`
   (Production + Preview). Opsional: `WHATSAPP_NOTIFY_WEBHOOK_URL`,
   `META_PAGE_TOKEN`, `META_PAGE_ID_POPBEEZ`, `META_PAGE_ID_NUSABEEZ`,
   `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID_BLINKBEEZ` — lihat `.env.example`.
4. **Deploy**.
5. Cek setelah Ready:
   - `/api/health` → `{"ok":true,"database":"ready"}`
   - `/` landing page dengan logo pilihan Anda
   - `/admin` → login dengan `ADMIN_PASSWORD`
   - `/studio-logo`, `/media-kit`, `/kebijakan`
   - `/kontak` → formulir landing; `/privasi` dan `/disclaimer` → bagian halaman kebijakan
6. **Settings → Domains** → pasang `www.hivecomp.my.id`.
7. Aktifkan **Analytics** dan **Speed Insights** di dashboard Vercel.
   Komponennya sudah terpasang di kode.

Tabel database (`leads`, `settings`, `articles`) dan 13 berita contoh dibuat
**otomatis** pada request pertama — tidak perlu `drizzle-kit push` di Vercel.

Rincian lengkap + troubleshooting: [`DEPLOY.md`](./DEPLOY.md).

---

## Yang sengaja tidak ada di dalam paket

| Berkas/folder | Alasan |
| --- | --- |
| `.env` | Berisi kredensial lokal. Nilai production diisi di Vercel. |
| `node_modules/` | Dibangun ulang oleh Vercel dari `package-lock.json`. |
| `.next/`, `.vercel/` | Artefak build, dibuat ulang setiap deploy. |
| `.git/` | Riwayat versi; repo baru GitHub memulai riwayatnya sendiri. |

Buat ulang paket kapan saja setelah ada perubahan:

```bash
python3 scripts/package-release.py
```
