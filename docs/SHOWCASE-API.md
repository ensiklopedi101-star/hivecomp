# Kontrak API Showcase — Backend PopBeez & NusaBeez

Dokumen ini untuk developer backend PopBeez/NusaBeez. Landing page HiveComp
(`www.hivecomp.my.id`) akan **membaca** endpoint ini dari server (bukan dari
browser pengunjung), lalu menampilkan 3 postingan terbaru tiap brand di bagian
**Showcase**.

## 1. Endpoint yang perlu disediakan

```
GET {BASE_URL}/showcase?brand=popbeez&limit=3
GET {BASE_URL}/showcase?brand=nusabeez&limit=3
Authorization: Bearer {TOKEN}
Accept: application/json
```

- Satu endpoint untuk dua brand — dibedakan lewat parameter `brand`.
- **Read-only.** Landing page tidak pernah mengirim data / mengubah apa pun.
- Wajib **HTTPS**.
- Balas dalam **< 6 detik** (lebih dari itu dianggap gagal → panel tampil
  "Belum terhubung").
- Token boleh string acak panjang; tolak request tanpa token dengan `401`.
- **CORS tidak diperlukan** — yang memanggil adalah server Vercel, bukan browser.

## 2. Format respons (200 OK)

```json
{
  "items": [
    {
      "id": "pb-20261120-001",
      "text": "5 drakor on-going yang ratingnya naik minggu ini",
      "url": "https://www.facebook.com/popbeez/posts/1234567890",
      "image": "https://cdn.popbeez.example/cards/20261120-001.jpg",
      "publishedAt": "2026-11-20T08:30:00+08:00",
      "likes": 1240,
      "comments": 86,
      "shares": 312,
      "views": null
    }
  ]
}
```

| Field | Wajib | Aturan |
|---|---|---|
| `id` | ✅ | String/angka unik per postingan |
| `text` | ✅ | Caption/judul news card. Dipotong otomatis ke 500 karakter, tampil 2 baris |
| `url` | ✅ | Link `https://` ke postingan asli (biasanya permalink Facebook) |
| `image` | – | Link `https://` gambar news card. Kosong → kotak warna brand |
| `publishedAt` | – | Format ISO 8601. Ditampilkan sebagai "20 Nov" |
| `likes`, `comments`, `shares` | – | Angka ≥ 0, atau `null` bila tidak tersedia |
| `views` | – | Biasanya `null` untuk Facebook Page |

Urutkan **terbaru dulu**. Landing page hanya memakai maksimal 3 item pertama.

Item yang tidak punya `id`, `text`, atau `url` https yang valid **akan dibuang**
(tidak ditebak/diisi). Angka `null` **tidak ditampilkan** — landing page tidak
pernah mengisi angka contoh.

## 3. Respons error

| Kondisi | Status | Yang tampil di landing |
|---|---|---|
| Token salah / tidak ada | `401` / `403` | "Belum terhubung" + tombol Ikuti |
| Error server | `5xx` | "Belum terhubung" + tombol Ikuti |
| `items` kosong | `200` | "Belum terhubung" + tombol Ikuti |

## 4. Mengaktifkan di Vercel

**Cara paling sederhana — satu URL lengkap per brand** (dipakai apa adanya):

```
POPBEEZ_API_URL   = https://backend-anda.com/api/pages/popbeez/posts
POPBEEZ_API_TOKEN = token-bearer-anda
NUSABEEZ_API_URL  = https://backend-anda.com/api/pages/nusabeez/posts
NUSABEEZ_API_TOKEN= token-bearer-anda   (boleh dikosongkan bila tokennya sama)
```

- URL boleh berbentuk apa saja, asalkan membalas JSON sesuai format di atas.
  Landing hanya menambahkan `?limit=3` bila URL belum memuat `limit`.
- Bila `NUSABEEZ_API_TOKEN` kosong, landing memakai `POPBEEZ_API_TOKEN`.
- NusaBeez **tidak** otomatis memakai URL PopBeez — tanpa `NUSABEEZ_API_URL`
  panelnya tetap "Belum terhubung".

**Alternatif — satu URL dasar untuk dua brand:**

```
POPNUSA_API_URL   = https://backend-anda.com        → {URL}/showcase?brand=...
POPNUSA_API_TOKEN = token-bearer-anda
```

Urutan prioritas per brand: URL lengkap per brand → URL dasar bersama →
Meta Graph API (`META_*`) → "Belum terhubung". Setelah mengisi env, **Redeploy**.

### Format respons yang juga diterima

Selain `{ "items": [...] }`, landing juga membaca `{ "data": [...] }`,
`{ "posts": [...] }`, atau array polos `[...]`. Nama field ala Facebook juga
diterima: `message` (teks), `permalink_url` (url), `full_picture` (gambar),
`created_time` (tanggal), serta `reactions.summary.total_count`,
`comments.summary.total_count`, `shares.count`. Aturan yang tidak berubah:
item wajib punya `id`, teks, dan URL https; angka yang tidak ada tetap
tidak ditampilkan.

## 5. Cek cepat

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://backend-anda.com/api/pages/popbeez/posts?limit=3"
```

Setelah Vercel redeploy, buka `https://www.hivecomp.my.id/api/showcase` —
`popbeez.connected` dan `nusabeez.connected` harus `true`.

Data di landing di-cache **5 menit**, jadi postingan baru muncul paling lambat
±5 menit setelah tersedia di backend. Tidak ada reach/impressions yang
ditampilkan; hanya data yang Anda kirim.
