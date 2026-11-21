# Menghubungkan Instagram ke Landing Page HiveComp

Ada **dua lapis**, dan lapis pertama tidak butuh token apa pun.

## Lapis 1 — Tombol Instagram (langsung jalan)

1. Buka `/admin` → **Tampilan & URL** → kartu **URL Brand**.
2. Isi **Instagram PopBeez** dengan `@handle` (mis. `@popbeez`) atau URL profil.
3. Simpan. Tombol Instagram muncul otomatis di:
   - kartu **Ekosistem** PopBeez (ikon bulat di samping tombol Ikuti),
   - panel **Showcase** PopBeez (tombol "Instagram" di samping tombol Ikuti).

Kolom kosong = tombol disembunyikan. Alamat selain `instagram.com` (HTTPS) ditolak.

## Lapis 2 — Postingan Instagram di Showcase (opsional)

Panel akan mendapat tab **Facebook | Instagram** berisi 3 postingan terbaru
(gambar, caption, tanggal, suka, komentar). Syarat:

- Akun Instagram bertipe **Profesional** (Business/Creator), bukan akun pribadi.
- Akun terhubung ke **Page Facebook** PopBeez.
- Page access token dengan izin `instagram_basic` dan `pages_show_list`
  atau `pages_read_engagement`.

Env di Vercel (lalu **Redeploy**):

```
META_PAGE_TOKEN        = token Page
META_PAGE_ID_POPBEEZ   = ID Page PopBeez        (ID akun Instagram dicari otomatis)
META_IG_USER_ID_POPBEEZ= (opsional) ID akun Instagram bila sudah tahu
```

Alternatif dari backend sendiri: `POPBEEZ_INSTAGRAM_API_URL` (+ token yang sama
dengan jalur Facebook) dengan format respons yang sama seperti postingan Facebook.

Cek: buka `/api/showcase` → `instagram.popbeez.connected` harus `true`. Bila
`false`, baca `reason`. Tab hanya tampil bila ada postingan yang valid; selain itu
tombol Instagram tetap ada dan tidak ada angka yang dikarang.

## Catatan

- Data di-cache ±5 menit.
- Jumlah suka bisa kosong bila disembunyikan pemilik akun — angkanya tidak ditampilkan.
- Postingan tanpa permalink HTTPS dibuang. Postingan video memakai gambar sampulnya.
- Izin `instagram_basic` untuk akun milik sendiri biasanya cukup dalam mode
  pengembangan; memakainya untuk akun orang lain membutuhkan App Review Meta.
