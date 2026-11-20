/** Original concept artwork. SVG geometry uses a 128 × 128 grid and currentColor. */
export type LogoBrandId = "hivecomp" | "popbeez" | "nusabeez" | "blinkbeez" | "e-beez" | "portal-hub";
export type LogoChoice = { id: string; code: string; title: string; direction: string; description: string; use: string; recommended: boolean; shape: string };
export type LogoBrand = { id: LogoBrandId; name: string; category: string; color: string; darkColor: string; intro: string; concepts: LogoChoice[] };
export type LogoSelections = Partial<Record<LogoBrandId, string>>;

export const LOGO_BRANDS: LogoBrand[] = [
  {
    id: "hivecomp", name: "HiveComp", category: "Grup media & commerce", color: "#FFB000", darkColor: "#A86700",
    intro: "Identitas induk yang tegas dan mudah menaungi lima karakter berbeda.",
    concepts: [
      {
        id: "hivecomp-01", code: "01", title: "Colony", direction: "Geometris · Terstruktur",
        description: "Heksagon sebagai rumah bersama, dengan huruf H yang dibentuk oleh ruang negatif. Sederhana tanpa kehilangan kaitan dengan nama Hive.",
        use: "Pilihan utama untuk identitas grup, favicon, dan tanda kepemilikan di seluruh brand.", recommended: true,
        shape: '<path fill="currentColor" fill-rule="evenodd" d="M64 7 113 35.5v57L64 121 15 92.5v-57L64 7ZM41 34v60h14V72h18v22h14V34H73v24H55V34H41Z"/>',
      },
      {
        id: "hivecomp-02", code: "02", title: "Wingform", direction: "Dinamis · Terbuka",
        description: "Dua bidang sayap mengapit sebuah penghubung. Mengambil gagasan lebah tanpa menggambar maskot secara harfiah.",
        use: "Cocok bila HiveComp ingin terlihat lebih kreatif, bergerak, dan dekat dengan industri konten.", recommended: false,
        shape: '<path fill="currentColor" d="m14 18 34 20v27L14 45V18Zm0 40 34 20v32L14 90V58Zm100-40L80 38v27l34-20V18Zm0 40L80 78v32l34-20V58ZM48 49l16-9 16 9v30L64 88l-16-9V49Z"/>',
      },
      {
        id: "hivecomp-03", code: "03", title: "HC Interlock", direction: "Monogram · Korporat",
        description: "Huruf H dan C saling mengunci dalam bentuk siku yang ringkas. Alternatif yang lebih tenang dan tidak bergantung pada simbol sarang.",
        use: "Kuat untuk dokumen bisnis, proposal mitra, cap satu warna, dan media kit.", recommended: false,
        shape: '<path fill="currentColor" d="M15 24h17v31h28V24h17v80H60V72H32v32H15V24Z"/><path fill="currentColor" d="M89 24h24v17H94v46h19v17H89L77 92V36l12-12Z"/>',
      },
    ],
  },
  {
    id: "popbeez", name: "PopBeez", category: "Hiburan Asia · Facebook", color: "#F54B8D", darkColor: "#BE225F",
    intro: "Ekspresif dan mudah dikenali di tengah ramainya feed hiburan.",
    concepts: [
      {
        id: "popbeez-01", code: "01", title: "Pop Talk", direction: "Percakapan · Ramah",
        description: "Balon percakapan bertemu monogram P. Menunjukkan konten yang tidak berhenti dibaca, tetapi memancing percakapan penggemar.",
        use: "Pilihan utama untuk foto profil Page, watermark news card, dan ikon komentar.", recommended: true,
        shape: '<path fill="currentColor" fill-rule="evenodd" d="M22 17h48c23 0 39 15 39 37S93 91 70 91H48l-26 24V17Zm26 21v32h20c11 0 18-6 18-16s-7-16-18-16H48Z"/>',
      },
      {
        id: "popbeez-02", code: "02", title: "Fan Spark", direction: "Pop · Ekspresif",
        description: "Empat kelopak menyerupai kilau panggung, dengan satu titik aksen. Tidak mengunci identitas ke satu negara atau satu jenis fandom.",
        use: "Lebih cocok untuk cover, stiker komunitas, dan materi hiburan yang penuh warna.", recommended: false,
        shape: '<path fill="currentColor" d="M58 9c6 0 12 23 18 31s29 12 29 19-23 13-29 20-12 30-18 30-12-23-19-30S10 66 10 59s22-12 29-19S52 9 58 9Z"/><circle fill="currentColor" cx="108" cy="20" r="10"/>',
      },
      {
        id: "popbeez-03", code: "03", title: "Double Bubble", direction: "Monogram · Playful",
        description: "Dua ruang bulat membentuk huruf B dengan siluet yang lembut. Lebih abstrak dan tidak terlalu menyerupai media berita formal.",
        use: "Alternatif untuk avatar dan identitas komunitas yang kasual namun tetap rapi.", recommended: false,
        shape: '<path fill="currentColor" fill-rule="evenodd" d="M25 14h37c24 0 39 12 39 30 0 9-4 16-12 21 12 5 18 13 18 24 0 19-16 30-41 30H25V14Zm22 19v25h15c10 0 16-4 16-13s-6-12-16-12H47Zm0 43v24h18c12 0 18-4 18-12s-6-12-18-12H47Z"/>',
      },
    ],
  },
  {
    id: "nusabeez", name: "NusaBeez", category: "Berita nasional · Facebook", color: "#EF4B42", darkColor: "#C7352E",
    intro: "Jelas, editorial, dan mudah dibaca pada news card berukuran kecil.",
    concepts: [
      {
        id: "nusabeez-01", code: "01", title: "Headline N", direction: "Editorial · Tegas",
        description: "Bidang kartu dengan sudut terpotong dan monogram N di dalamnya. Bentuknya merujuk ke format news card, bukan lambang institusi.",
        use: "Pilihan utama untuk pojok kartu berita, foto profil, dan identitas redaksi.", recommended: true,
        shape: '<path fill="currentColor" fill-rule="evenodd" d="M17 14h74l20 20v80H17V14Zm20 23v54h13V60l28 31h13V37H78v31L50 37H37Z"/>',
      },
      {
        id: "nusabeez-02", code: "02", title: "News Signal", direction: "Aktual · Dinamis",
        description: "Tiga pita bersudut membentuk N yang tampak bergerak. Arah ini lebih ringan daripada logo redaksi konvensional.",
        use: "Cocok untuk cover breaking news, motion bumper, dan tipografi judul yang berani.", recommended: false,
        shape: '<path fill="currentColor" d="m17 28 20-12v96l-20-12V28Zm27-8 24 14 18 58-24-14-18-58Zm47-4 20 12v72l-20 12V16Z"/>',
      },
      {
        id: "nusabeez-03", code: "03", title: "Open Pages", direction: "Informatif · Terbuka",
        description: "Dua halaman terbuka membentuk ruang baca di tengah. Memberi kesan informatif tanpa memakai ikon bendera atau peta.",
        use: "Alternatif yang lebih bersahabat untuk berita penjelasan dan infografik.", recommended: false,
        shape: '<path fill="currentColor" fill-rule="evenodd" d="M13 23h36l15 12 15-12h36v77H79l-15 12-15-12H13V23Zm15 16v12h22V39H28Zm0 23v8h22v-8H28Zm0 18v8h22v-8H28Zm50-41v12h22V39H78Zm0 23v8h22v-8H78Zm0 18v8h22v-8H78Z"/>',
      },
    ],
  },
  {
    id: "blinkbeez", name: "BlinkBeez", category: "Video pendek · YouTube", color: "#A58AF5", darkColor: "#7150BD",
    intro: "Cepat terbaca, punya gerak, dan tetap khas tanpa meniru logo YouTube.",
    concepts: [
      {
        id: "blinkbeez-01", code: "01", title: "Flash Play", direction: "Cepat · Berenergi",
        description: "Segitiga putar dipotong kilatan petir. Menegaskan video pendek yang langsung ke inti topik.",
        use: "Pilihan yang lugas untuk bumper video, watermark, dan avatar kanal.", recommended: false,
        shape: '<path fill="currentColor" fill-rule="evenodd" d="M20 12 117 64 20 116V12Zm50 24L44 68h19L52 96l35-46H68l2-14Z"/>',
      },
      {
        id: "blinkbeez-02", code: "02", title: "Blink Eye", direction: "Ikonik · Fokus",
        description: "Mata yang menyimpan tombol putar sebagai pupilnya. Menghubungkan nama Blink dengan kebiasaan melihat video dalam sekali lirik.",
        use: "Rekomendasi utama: lebih mudah dikaitkan dengan nama BlinkBeez, tidak sekadar ikon play generik.", recommended: true,
        shape: '<path fill="currentColor" fill-rule="evenodd" d="M6 64C23 36 42 23 64 23s41 13 58 41c-17 28-36 41-58 41S23 92 6 64Zm23 0c11 15 22 22 35 22s24-7 35-22c-11-15-22-22-35-22s-24 7-35 22Z"/><path fill="currentColor" d="m55 49 25 15-25 15V49Z"/>',
      },
      {
        id: "blinkbeez-03", code: "03", title: "Frame B", direction: "Monogram · Digital",
        description: "Monogram B dengan dua celah segitiga, seperti dua frame video yang berurutan. Identitas lebih padat dan berani.",
        use: "Kuat untuk profil kanal, overlay sudut video, dan konten berlatar ramai.", recommended: false,
        shape: '<path fill="currentColor" fill-rule="evenodd" d="M24 14h47l29 19v24L87 65l19 12v26l-27 15H24V14Zm23 22v23l24-12-24-11Zm0 39v23l28-12-28-11Z"/>',
      },
    ],
  },
  {
    id: "e-beez", name: "E-Beez", category: "Marketplace · Commerce", color: "#32C69A", darkColor: "#157C60",
    intro: "Ramah untuk pembeli, jelas sebagai produk commerce, dan mudah dijadikan ikon aplikasi.",
    concepts: [
      {
        id: "e-beez-01", code: "01", title: "Carry e", direction: "Commerce · Ramah",
        description: "Tas belanja dengan huruf e dari ruang negatif. Fungsi belanja langsung terbaca, tetapi tetap menyimpan inisial brand.",
        use: "Pilihan utama untuk ikon aplikasi, header toko, stiker kemasan, dan avatar bisnis.", recommended: true,
        shape: '<path fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round" d="M45 39V28a19 19 0 0 1 38 0v11"/><path fill="currentColor" fill-rule="evenodd" d="M25 36h78l9 75H16l9-75Zm62 39c0-16-8-25-22-25-15 0-25 11-25 27 0 17 10 27 26 27 9 0 17-3 22-8l-7-9c-4 3-8 5-14 5-7 0-11-3-12-10h32v-7ZM55 71c1-6 4-10 10-10s9 4 10 10H55Z"/>',
      },
      {
        id: "e-beez-02", code: "02", title: "Loop Check", direction: "Modern · Tepercaya",
        description: "Lingkar e terbuka berakhir pada tanda centang. Mengarah ke pengalaman belanja yang selesai, mudah, dan terasa tertata.",
        use: "Alternatif yang lebih minimal untuk antarmuka, status pesanan, serta notifikasi aplikasi.", recommended: false,
        shape: '<path fill="none" stroke="currentColor" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" d="M87 95a42 42 0 1 1 18-48H27M67 74l15 15 31-31"/>',
      },
      {
        id: "e-beez-03", code: "03", title: "Market Wings", direction: "Keluarga Hive · Bersahabat",
        description: "Sepasang sayap dan paket segi enam membentuk lebah abstrak. Kaitannya dengan keluarga HiveComp paling terasa pada opsi ini.",
        use: "Cocok untuk kemasan dan kampanye apabila koneksi antarmerek ingin dibuat lebih kentara.", recommended: false,
        shape: '<path fill="currentColor" d="M53 49C17 50 10 23 26 17c17-7 31 10 27 32Zm22 0c36 1 43-26 27-32-17-7-31 10-27 32Z"/><path fill="currentColor" fill-rule="evenodd" d="m64 43 36 21v35l-36 21-36-21V64l36-21ZM46 70v9h36v-9H46Zm0 17v9h25v-9H46Z"/>',
      },
    ],
  },
  {
    id: "portal-hub", name: "Portal-Hub", category: "Agregator berita · Web", color: "#38ADE5", darkColor: "#176E99",
    intro: "Terbuka, terhubung, dan dapat berdiri sendiri sebagai produk berita.",
    concepts: [
      {
        id: "portal-hub-01", code: "01", title: "Gateway", direction: "Portal · Arsitektural",
        description: "Dua gerbang bertingkat dengan sebuah ambang di tengah. Gagasan portal diterjemahkan menjadi simbol yang kokoh dan mudah dibaca.",
        use: "Pilihan utama untuk favicon situs, header agregator, dan ikon aplikasi web.", recommended: true,
        shape: '<path fill="currentColor" d="M17 113V45C17 18 38 7 64 7s47 11 47 38v68H94V47c0-16-11-23-30-23s-30 7-30 23v66H17Z"/><path fill="currentColor" d="M46 113V51c0-11 7-17 18-17s18 6 18 17v62H69V61H59v52H46Z"/>',
      },
      {
        id: "portal-hub-02", code: "02", title: "Orbit Hub", direction: "Terhubung · Menyeluruh",
        description: "Satu pusat dikelilingi tiga lintasan informasi. Menekankan fungsi agregasi dari banyak sumber tanpa menggambarkan alur antarmerek.",
        use: "Alternatif untuk produk dengan banyak kategori, sumber, atau kanal berita.", recommended: false,
        shape: '<g fill="none" stroke="currentColor" stroke-width="8"><ellipse cx="64" cy="64" rx="52" ry="23" transform="rotate(-34 64 64)"/><ellipse cx="64" cy="64" rx="52" ry="23" transform="rotate(86 64 64)"/></g><circle fill="currentColor" cx="64" cy="64" r="12"/><circle fill="currentColor" cx="111" cy="45" r="9"/><circle fill="currentColor" cx="47" cy="111" r="9"/>',
      },
      {
        id: "portal-hub-03", code: "03", title: "Feed Grid", direction: "Modular · Editorial",
        description: "Empat panel berita bertemu pada ruang kosong berbentuk bintang. Terasa seperti antarmuka agregator yang menyatukan beragam kategori.",
        use: "Lebih fleksibel untuk kategori berita, sistem ikon, dan identitas yang sering dianimasikan.", recommended: false,
        shape: '<path fill="currentColor" d="M16 16h41v25L41 57H16V16Zm55 0h41v41H87L71 41V16ZM16 71h25l16 16v25H16V71Zm71 0h25v41H71V87l16-16Z"/>',
      },
    ],
  },
];

export const LOGO_BRAND_IDS = LOGO_BRANDS.map((b) => b.id);
export const RECOMMENDED_LOGOS: LogoSelections = Object.fromEntries(LOGO_BRANDS.map((b) => [b.id, b.concepts.find((c) => c.recommended)!.id]));
/** Final owner-approved selections applied as the site defaults. */
export const SELECTED_LOGOS = {
  hivecomp: "hivecomp-01",
  popbeez: "popbeez-01",
  nusabeez: "nusabeez-01",
  blinkbeez: "blinkbeez-01",
  "e-beez": "e-beez-03",
  "portal-hub": "portal-hub-01",
} as const satisfies Record<LogoBrandId, string>;
export const findLogoBrand = (id: string) => LOGO_BRANDS.find((b) => b.id === id);
export const findLogoConcept = (id: string) => LOGO_BRANDS.flatMap((b) => b.concepts).find((c) => c.id === id);
export const logoAsset = (id: string, type: "mark" | "logo" | "logo-dark" | "mono" = "mark") => `/logos/${id}-${type}.svg`;
