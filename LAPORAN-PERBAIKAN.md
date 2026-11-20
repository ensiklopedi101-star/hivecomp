# Laporan Perbaikan — `/api/health` `{"ok":false}` & Panel Admin

Tanggal: 20 November 2026
Branch: `arena/7d7e4de7-hivecomp` (commit `b257352`)
Deployment production: `dpl_CtwtRJAsELJJ8b8zZtRbvxDHVqpK` → alias `hivecomp.vercel.app`

---

## 1. Kesalahan utamanya di mana?

**Bukan salah Neon, bukan salah password, dan bukan salah konfigurasi Vercel.**

Masalahnya ada di **`src/db/index.ts`**: kode hanya mencari variabel bernama
persis `DATABASE_URL` atau `POSTGRES_URL`.

```ts
// KODE LAMA
const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!databaseUrl) throw new Error("DATABASE_URL (or POSTGRES_URL) is required ...");
```

Sedangkan integrasi Neon yang Anda pasang di Vercel menambahkan variabel dengan
**prefix nama database**. Saya cek langsung di project Vercel Anda
(`prj_vUGPQTWtzssMRYjGaSl64iAokrKU`) dan yang terpasang adalah:

| Env var yang ADA (Production) | Env var yang DICARI kode lama | Hasil |
| --- | --- | --- |
| `HIVE_DATABASE_URL` | `DATABASE_URL` | ❌ tidak ketemu |
| `HIVE_POSTGRES_URL` | `POSTGRES_URL` | ❌ tidak ketemu |
| `HIVE_POSTGRES_PRISMA_URL`, `HIVE_DATABASE_URL_UNPOOLED`, dst. | — | ❌ tidak dibaca |

Karena tidak satu pun cocok, `db` melempar error di setiap query:

- `/api/health` → `catch` → `{"ok": false}` — **persis gejala yang Anda lihat.**
- `/admin` → `ensureSchema()` melempar error di luar `try` → halaman **500**,
  sehingga panel admin tidak pernah terbuka (bahkan untuk login).

Anehnya landing page tetap jalan karena `getSettings()` punya fallback diam-diam
ke data default — jadi kerusakan database tidak terlihat dari halaman depan.

---

## 2. Yang diperbaiki

| File | Perbaikan |
| --- | --- |
| `src/db/index.ts` | `resolveDatabaseUrl()` membaca `DATABASE_URL`/`POSTGRES_URL` **lalu** varian ber-prefix (`*_DATABASE_URL`, `*_POSTGRES_URL`, termasuk `_UNPOOLED`/`_NON_POOLING`), mengutamakan connection string **pooled** (penting untuk serverless). SSL otomatis mengikuti `sslmode` atau host provider. |
| `src/app/api/health/route.ts` | Tidak lagi bisu. Membedakan **`not_configured`** (env tidak ada) vs **`error`** (gagal connect), plus `envKey` (var mana yang dipakai), `envKeysFound`, dan pesan penyebab yang aman (tanpa kredensial). |
| `src/app/admin/page.tsx` | Query DB dibungkus `try/catch` → panel admin **selalu bisa dibuka & login** walaupun database bermasalah. |
| `src/components/admin-dashboard.tsx` | Banner “Database bermasalah” berisi petunjuk + pesan error asli. |
| `src/db/ensure.ts` | Bootstrap tabel dalam transaksi + `pg_advisory_xact_lock` (aman saat banyak cold start bersamaan), index unik dibuat defensif (tidak menggagalkan bootstrap pada DB lama yang sudah berisi judul duplikat), seed demo hanya saat tabel kosong (tidak lagi berpotensi menggandakan 13 artikel tiap cold start). |
| `src/lib/auth.ts` | `ADMIN_PASSWORD` yang kosong/berisi spasi kini dianggap **belum diset** (jatuh ke `hive-admin`). Sebelumnya nilai kosong membuat password admin menjadi string kosong → login **mustahil** karena form menolak input kosong. |
| `.gitignore` (baru) | Repo ini **tidak punya `.gitignore`** — `.env` dan folder build bisa ikut ter-commit. Sekarang aman. |
| `package-lock.json` (baru) | Lockfile tidak ada, padahal `DEPLOY.md` mewajibkannya agar install Vercel deterministik. |
| `DEPLOY.md`, `README.md` | Dokumentasi soal env ber-prefix + tabel troubleshooting baru. |

---

## 3. Bukti pengujian

Diuji dengan **PostgreSQL 18 sungguhan** (bukan tiruan) di sandbox, memakai
build produksi `next build` + `next start`, dengan kondisi env **sama seperti di
Vercel** (hanya `HIVE_*`, tanpa `DATABASE_URL`):

```
GET /api/health
→ {"ok":true,"database":"ready","envKey":"HIVE_DATABASE_URL",
   "envKeysFound":["HIVE_DATABASE_URL","HIVE_POSTGRES_URL"]}      HTTP 200

Tabel dibuat otomatis: articles, leads, settings
Seed artikel: 13 (sekali saja, tidak berulang)
Index: articles_pkey, articles_title_unique

POST /api/admin/login  {"password":"hive-admin"}   → 200 {"ok":true}
GET  /admin (sesudah login)                        → 200, dashboard tampil
PUT  /api/admin/settings                           → 200 {"ok":true}
POST /api/leads                                    → 201, lead tersimpan
POST /api/admin/articles                           → 201, artikel masuk
GET  /  (landing)                                  → setting baru langsung tampil
```

Skenario kegagalan juga diuji:

| Kondisi | Respons `/api/health` |
| --- | --- |
| Env tidak ada / kosong | `503` `{"ok":false,"database":"not_configured", ...}` |
| Password DB salah / host mati | `500` `{"ok":false,"database":"error","error":"... ⟵ connect ECONNREFUSED ...", "hint":"..."}` |
| Admin password env kosong | login dengan `hive-admin` → berhasil (tidak lagi mustahil) |

`npx tsc --noEmit` bersih, `next build` sukses (daftar route lengkap 27 entri).

---

## 4. Status deployment

- Build **preview** branch ini di Vercel: **READY** ✅
- Build **production** commit `b257352`: **READY**, alias `hivecomp.vercel.app`
  sudah diarahkan ke deployment baru ✅
- Daftar env di deployment production sudah memuat `HIVE_DATABASE_URL`,
  `HIVE_POSTGRES_URL`, dst. — artinya sekarang benar-benar terbaca kode baru.

> Catatan: verifikasi `curl` dari sandbox ke `*.vercel.app` diblokir oleh
> kebijakan jaringan sandbox (SSL_ERROR_SYSCALL sejak sebelum perubahan), jadi
> konfirmasi akhir silakan buka di browser Anda.

---

## 5. Yang perlu Anda lakukan sekarang

1. Buka **https://hivecomp.vercel.app/api/health** → harus muncul
   `{"ok":true,"database":"ready","envKey":"HIVE_DATABASE_URL", ...}`.
   Jika masih `ok:false`, sekarang pesannya **menyebutkan penyebabnya** — kirim
   saja isi JSON-nya.
2. Buka **https://hivecomp.vercel.app/admin**. Password yang berlaku:
   - `ADMIN_PASSWORD` Anda **jika** nilainya benar-benar terisi, atau
   - `hive-admin` **jika** variabel itu kosong (perilaku baru).
3. Setelah itu **isi `ADMIN_PASSWORD` dengan password kuat** di Vercel →
   Settings → Environment Variables → Production + Preview → **Redeploy**.
4. Merge branch `arena/7d7e4de7-hivecomp` ke `main` agar perbaikan ini permanen
   (production saat ini sudah jalan dengan kode ini, tapi `main` masih kode lama —
   deploy berikutnya dari `main` akan mengembalikan bug bila belum di-merge).
