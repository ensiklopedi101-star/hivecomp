# HiveComp Brand Studio — 18 Konsep Logo

Buka **`/studio-logo`** melalui footer landing page atau tombol Studio Logo pada panel admin.
Tersedia tiga arah bentuk berbeda untuk masing-masing dari enam nama, bukan sekadar variasi warna.

| Brand | Opsi 01 | Opsi 02 | Opsi 03 | Rekomendasi |
|---|---|---|---|---|
| HiveComp | Colony — heksagon H | Wingform — sayap geometris | HC Interlock — monogram | Colony / 01 |
| PopBeez | Pop Talk — balon percakapan P | Fan Spark — kilau panggung | Double Bubble — monogram B | Pop Talk / 01 |
| NusaBeez | Headline N — kartu editorial | News Signal — pita N | Open Pages — halaman terbuka | Headline N / 01 |
| BlinkBeez | Flash Play — video & petir | Blink Eye — mata & play | Frame B — dua frame video | Blink Eye / 02 |
| E-Beez | Carry e — tas belanja & e | Loop Check — e & centang | Market Wings — paket bersayap | Carry e / 01 |
| Portal-Hub | Gateway — dua gerbang | Orbit Hub — pusat & orbit | Feed Grid — panel berita | Gateway / 01 |

## Pilihan final pemilik

- HiveComp: **01 / Colony**
- PopBeez: **01 / Pop Talk**
- NusaBeez: **01 / Headline N**
- BlinkBeez: **01 / Flash Play**
- E-Beez: **03 / Market Wings**
- Portal-Hub: **01 / Gateway**

Keenam pilihan ini menjadi logo bawaan situs. Pilihan BlinkBeez dan E-Beez
berbeda dari rekomendasi awal asisten, dan keputusan pemilik yang berlaku.

## Yang dapat dilakukan di galeri

- Filter per brand atau tampilkan hanya rekomendasi.
- Uji latar terang, gelap, dan satu warna; lihat simbol atau wordmark.
- Lihat ukuran simbol 16 / 24 / 32 px.
- Unduh simbol SVG, wordmark SVG, atau PNG transparan tiap konsep.
- Buka lembar perbandingan PNG untuk setiap brand.
- Unduh `/logos/hivecomp-18-logo-concepts.zip` untuk seluruh aset dan lisensi font.
- Tanpa login, shortlist disimpan di localStorage perangkat.
- Dengan login admin, shortlist disimpan di PostgreSQL (settings key `logo_concepts`).
- Memilih TIDAK mengganti logo situs. Tombol **Terapkan ke landing page** memerlukan login admin dan konfirmasi.

## Aset

Aset berada di `public/logos/`. Ada 18 simbol, 18 identitas berlatar transparan
untuk media terang, versi wordmark untuk latar gelap, simbol monokrom,
PNG 1024px/1740px, enam board brand, dan satu poster seluruh konsep.

Wordmark memakai **Space Grotesk Bold** oleh Florian Karsten (lisensi SIL OFL).
Seluruh tulisan dalam SVG sudah diubah menjadi path; tidak perlu menginstal font
untuk membuka file hasilnya. Simbol dibuat dengan geometri SVG, bukan menyalin
ikon Facebook/YouTube atau memakai logo platform sebagai logo brand.

Sumber font dan lisensi ada di `scripts/assets/`. Regenerasi aset:

`node --experimental-strip-types scripts/build-logos.mjs`

ZIP hanya perlu dibuat ulang jika aset berubah. Paket unduhan berisi
`OFL-Space-Grotesk.txt` serta `BACA-DULU.txt`.

## Status desain

Ini adalah **konsep untuk dipilih dan disempurnakan**, bukan klaim pendaftaran
atau eksklusivitas merek dagang. Sebelum pemakaian final, periksa kemiripan
merek, ejaan nama, warna, jarak aman, dan keterbacaan pada media sebenarnya.
Tidak ada logo lama yang otomatis diganti setelah pembaruan ini.
