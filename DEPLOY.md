# 🚀 Deploy HiveComp ke Vercel lewat GitHub

> **Sudah zero-config:** aplikasi membuat tabel database DAN mengisi 13 berita
> demo Portal-Hub secara otomatis pada request pertama. Anda **tidak perlu**
> menjalankan `drizzle-kit push`, `psql`, atau seed SQL di Vercel.

---

## JALUR UTAMA — Vercel Git Integration (paling mudah, ~5 menit)

### Langkah 1 — Push kode ke GitHub

Buka terminal **di folder proyek ini**, lalu:

```bash
git init                                  # sudah dilakukan di workspace ini
git add .
git commit -m "HiveComp: initial release"  # sudah dilakukan di workspace ini

# Buat repo kosong di https://github.com/new (JANGAN centang README/.gitignore),
# lalu sambungkan dan push:
git remote add origin https://github.com/USERNAME/hivecomp.git
git branch -M main
git push -u origin main
```

Alternatif cepat kalau GitHub CLI sudah login: `gh repo create hivecomp --public --source=. --push`.

> ✅ `.gitignore` sudah menyiapkan agar **`.env` dan `node_modules` tidak ikut
> ter-upload**. `package-lock.json` **harus** ikut (Vercel memakainya untuk
> install yang deterministik).

### Langkah 2 — Import di Vercel

1. Buka **https://vercel.com/new** → login dengan akun GitHub Anda.
2. Pilih repository `hivecomp` → klik **Import**.
3. Framework otomatis terdeteksi **Next.js**. **Jangan ubah** Build Command
   (`next build`) atau Output Directory — biarkan default.
4. **Jangan klik Deploy dulu**, lanjut ke Langkah 3.

### Langkah 3 — Tambah Database (Vercel Postgres / Neon)

1. Di project Vercel → tab **Storage** → **Create Database** → pilih
   **Postgres (Neon)** → **Continue**.
2. Vercel akan menambahkan Environment Variables untuk **Production, Preview,
   dan Development**.
   > ⚠️ **Penting — perhatikan nama variabelnya.** Integrasi Marketplace (Neon)
   > bisa menambahkan **prefix** sesuai nama database, misalnya
   > `HIVE_DATABASE_URL`, `HIVE_POSTGRES_URL`, `HIVE_PGHOST`, dst. Aplikasi
   > sudah membaca nama ber-prefix itu (varian pooled lebih diutamakan), jadi
   > tidak perlu rename. Yang **wajib** dicek: variabel tersebut harus
   > tercentang untuk environment **Production**, lalu **Redeploy**.
3. Pilih region terdekat (Singapore `Sin1` bila tersedia) agar latensi rendah
   agar latensi tetap rendah bagi pengunjung lokal.
4. Cek `https://<domain>/api/health`. Respons sukses:
   `{"ok":true,"database":"ready","envKey":"HIVE_DATABASE_URL",...}` — `envKey`
   menunjukkan variabel mana yang dipakai. Bila gagal, responsnya menyebut
   penyebabnya (`not_configured` vs `error` + pesan dari driver).

### Langkah 4 — Set password admin

**Settings → Environment Variables**, tambahkan:

| Name             | Value                       | Environment        |
| ---------------- | --------------------------- | ------------------ |
| `ADMIN_PASSWORD` | password kuat pilihan Anda  | Production + Preview |

Tanpa variabel ini panel `/admin` memakai password default `hive-admin` —
**jangan biarkan seperti itu di production.**

**Opsional — Notifikasi Lead ke WhatsApp:**
Set `WHATSAPP_NOTIFY_WEBHOOK_URL` (beserta `WHATSAPP_NOTIFY_TOKEN` dan
`WHATSAPP_NOTIFY_TARGET` bila menggunakan Fonnte/Wablas/Make/n8n). Setiap
kiriman formulir kerja sama baru akan otomatis dikirim ke WhatsApp Anda.
Meskipun belum diset, Anda tetap bisa membalas ke nomor WA pengirim atau
meneruskan lead ke WA Anda dalam 1 klik dari `/admin` → tab **Pesan Masuk**,
serta mengunduh seluruh data sebagai CSV.

**Opsional — Konektor Showcase (cache 5 menit):**
`META_PAGE_TOKEN`, `META_PAGE_ID_POPBEEZ`, `META_PAGE_ID_NUSABEEZ`,
`META_GRAPH_VERSION`, `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_ID_BLINKBEEZ`.
Semua dibaca server-side (jangan beri prefix `NEXT_PUBLIC_`) dan di-cache
5 menit agar kuota YouTube Data API (100 unit per `search.list`) hemat.

### Langkah 7 — Aktifkan Vercel Analytics & Uptime Monitor Gratis

1. Di dashboard project Vercel → tab **Analytics** → klik **Enable**, lalu tab
   **Speed Insights** → klik **Enable** (komponen `<Analytics />` dan
   `<SpeedInsights />` sudah terpasang di kode).
2. Buat akun gratis di **UptimeRobot** atau **BetterStack** → tambahkan monitor
   HTTP(s) ke `https://www.hivecomp.my.id/api/health` (interval 5 menit) →
   hubungkan alert ke WhatsApp/webhook Anda agar langsung tahu bila server
   atau database mengalami gangguan.

### Langkah 5 — Deploy 🎉

Klik **Deploy**. Setelah status *Ready*:

- Buka `https://hivecomp.vercel.app/` → landing page
- Buka `/api/health` → harus `{"ok":true,"database":"ready"}` —
  endpoint ini juga memicu pembuatan tabel otomatis
- Buka `/portal-hub` → 13 berita demo sudah ada
- Buka `/admin` → login dengan `ADMIN_PASSWORD` Anda

### Langkah 6 — Setelah live

- **Settings → Domains** → arahkan domain `hivecomp.id` (Vercel bantu setting DNS/SSL gratis).
- Masuk `/admin` → tab **Tampilan & URL** → isi URL Facebook PopBeez,
  NusaBeez, YouTube BlinkBeez, dan domain asli E-Beez / Portal-Hub.
- Terbitkan berita pertama di tab **Berita Portal-Hub** — kategori *Nasional*
  langsung jadi news card NusaBeez, *Hiburan* jadi news card PopBeez.

> ✨ **Auto-deploy:** setiap `git push origin main` setelah ini langsung
> membangun ulang production. Push ke branch lain otomatis dapat Preview URL.

---

## JALUR ALTERNATIF — GitHub Actions (opsional)

Kalau Anda lebih suka kontrol lewat Actions, workflow
`.github/workflows/vercel-deploy.yml` sudah disertakan. Ia hanya jalan saat
dipicu manual (**Run workflow**) agar tidak deploy dobel bareng Git Integration.

Tambahkan 3 **Repository Secrets** di GitHub
(*Settings → Secrets and variables → Actions*):

| Secret              | Cara mendapatkan                                      |
| ------------------- | ----------------------------------------------------- |
| `VERCEL_TOKEN`      | Vercel → Settings → Tokens → Create Token              |
| `VERCEL_ORG_ID`     | Jalankan `npx vercel link`, lalu lihat `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | File yang sama → `projectId`                           |

**Pilih salah satu jalur saja.** Pakai Git Integration (Jalur Utama) ATAU
Actions — jangan dua-duanya aktif untuk production.

---

## 🔧 Troubleshooting

| Gejala | Penyebab & solusi |
| --- | --- |
| Build gagal: `DATABASE_URL is required` | Koneksi sekarang lazy, jadi bukan ini. Cek `npm run build` lokal; biasanya error TypeScript. |
| `/api/health` → `{"ok":false,"database":"not_configured"}` | Tidak ada connection string yang terbaca. Cek Environment Variables: pasti ada `DATABASE_URL` **atau** varian ber-prefix (`HIVE_DATABASE_URL`), terpasang untuk **Production**, lalu **Redeploy**. Respons memuat `envKeysFound` untuk menunjukkan var database apa saja yang terlihat. |
| `/api/health` → `{"ok":false,"database":"error"}` | Koneksi string ada tapi gagal connect. Pesan `error` menyebut sebabnya (password salah, host mati, database ter-suspend). Pastikan memakai URL **pooled** (`…-pooler…`). |
| `/admin` terbuka tapi ada banner “Database bermasalah” | Panel sengaja tetap tampil; datanya kosong. Perbaiki database sesuai `/api/health` di atas. |
| Login `/admin` selalu gagal padahal password benar | Env `ADMIN_PASSWORD` mungkin dibuat dengan **nilai kosong** — dianggap belum diset, jadi password aktif adalah `hive-admin`. Isi nilainya (atau hapus variabelnya), lalu Redeploy. |
| Halaman kosong / 500 saat pertama dibuka | Cold start pertama sedang membuat tabel. Refresh 1–2 kali, lalu cek `/api/health`. |
| `/admin` tidak mau login | `ADMIN_PASSWORD` berubah setelah cookie lama diterbitkan → logout, lalu login lagi. |
| Gambar berita tidak muncul | Demo memakai URL Pexels publik; pastikan domain gambar tidak diblokir jaringan. Ganti lewat admin. |
| `ADMIN_PASSWORD` baru tidak berlaku | Vercel mewajibkan **Redeploy** setelah mengubah env var. |

---

## Ringkasan apa yang perlu Anda lakukan sendiri

Saya **tidak bisa** membuat repo GitHub / project Vercel atas nama Anda karena
tidak ada akses ke akun dan token Anda. Yang **sudah saya siapkan**:

- ✅ Git repo ter-`init` + commit awal yang bersih
- ✅ `.gitignore` aman (`.env` tidak bocor), `package-lock.json` lengkap
- ✅ Koneksi database kompatibel `DATABASE_URL` / `POSTGRES_URL`
- ✅ Pool kecil + SSL untuk serverless Vercel
- ✅ Tabel & konten demo **auto-bootstrap** (tanpa `psql`/`drizzle-kit push`)
- ✅ Koneksi lazy supaya build tetap sukses walau database belum di-attach
- ✅ Workflow GitHub Actions opsional
- ✅ `/api/health` untuk healthcheck

**Yang tersisa untuk Anda: 3 klik** — `git push`, Import repo, Create Postgres.
