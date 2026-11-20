/** Client-safe constants, types, and demo data (no database imports here). */

export const CATEGORIES = [
  "Nasional",
  "Hiburan",
  "Ekonomi",
  "Olahraga",
  "Teknologi",
  "Lifestyle",
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  Nasional: "#e11d48",
  Hiburan: "#db2777",
  Ekonomi: "#d97706",
  Olahraga: "#16a34a",
  Teknologi: "#0284c7",
  Lifestyle: "#7c3aed",
};

export type ArticleDTO = {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  source: string;
  dateLabel: string;
};

export type LeadDTO = {
  id: number;
  name: string;
  contact: string;
  interest: string;
  message: string;
  dateLabel: string;
};

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export const formatDate = (d: Date | string) => dateFmt.format(new Date(d));

const img = (id: number, ext = "jpeg") =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${ext}?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200`;

/** Built-in demo content — shown when the database has no articles yet. */
export const SAMPLE_ARTICLES: ArticleDTO[] = [
  {
    id: 1,
    title: "Jalan Baru Rampung, Waktu Tempuh Antar Kota kini Hanya 35 Menit",
    category: "Nasional",
    excerpt:
      "Percepatan konektivitas membuka peluang logistik dan pariwisata pesisir. Pelaku UMKM mulai melirik jalur distribusi baru.",
    imageUrl: img(38675673),
    source: "Portal-Hub Nasional",
    dateLabel: "10 Feb 2026",
  },
  {
    id: 2,
    title: "Harga Beras Medium Turun di 120 Kabupaten, Program SPHP Diperpanjang",
    category: "Nasional",
    excerpt:
      "Panen raya dan intervensi pasar menekan harga pangan. Pemerintah memastikan stok aman hingga kuartal berikutnya.",
    imageUrl: img(8102606),
    source: "Portal-Hub Nasional",
    dateLabel: "10 Feb 2026",
  },
  {
    id: 3,
    title: "Internet Masuk Desa Capai 92%, Pemerintah Kejar 100% Tahun Ini",
    category: "Nasional",
    excerpt:
      "Program perluasan jaringan menyasar wilayah terluar, terdepan, dan terpencil. Percepatan konektivitas tertinggi justru tercatat di sejumlah daerah baru.",
    imageUrl: img(11129922),
    source: "Portal-Hub Nasional",
    dateLabel: "9 Feb 2026",
  },
  {
    id: 4,
    title: "Partisipasi Pemilih Muda Diprediksi Melonjak di Pilkada Serentak",
    category: "Nasional",
    excerpt:
      "Kampanye digital dan konten pendek terbukti efektif menggerakkan pemilih Gen Z ke TPS.",
    imageUrl: img(32327756),
    source: "Portal-Hub Nasional",
    dateLabel: "9 Feb 2026",
  },
  {
    id: 5,
    title: 'Drakor "Bon Appétit, Your Majesty" Puncaki Rating Global, Ending Jadi Perdebatan',
    category: "Hiburan",
    excerpt:
      "Drama kolosal-fusi ini mencatat rating dua digit empat episode beruntun. Komunitas fans ramai membahas teori alternatif ending.",
    imageUrl: img(13230484),
    source: "Portal-Hub Entertainment",
    dateLabel: "10 Feb 2026",
  },
  {
    id: 6,
    title: "Comeback Idol Grup Generasi 5: Pre-Order Album Tembus 2 Juta Kopi",
    category: "Hiburan",
    excerpt:
      "Rekor baru untuk grup rookie. Agensi menambah jadwal fansign di lima kota Asia Tenggara.",
    imageUrl: img(4218027),
    source: "Portal-Hub Entertainment",
    dateLabel: "10 Feb 2026",
  },
  {
    id: 7,
    title: 'Donghua "Renegade Immortal" Season 2 Dikonfirmasi, Teaser Perdana Dirilis',
    category: "Hiburan",
    excerpt:
      "Studio mengungkap peningkatan kualitas animasi pertarungan. Komunitas donghua langsung trending.",
    imageUrl: img(10517352),
    source: "Portal-Hub Entertainment",
    dateLabel: "9 Feb 2026",
  },
  {
    id: 8,
    title: 'Dracin "The Double" Bakal Dibuat Ulang? Rumah Produksi Buka Suara',
    category: "Hiburan",
    excerpt:
      "Rumor adaptasi lokal berhembus kencang setelah unggahan teaser misterius. Fans terbelah antara antusias dan skeptis.",
    imageUrl: img(32081035),
    source: "Portal-Hub Entertainment",
    dateLabel: "8 Feb 2026",
  },
  {
    id: 9,
    title: "Rupiah Menguat ke Rp15.400, Analis Soroti Arus Modal Asing Masuk",
    category: "Ekonomi",
    excerpt:
      "Sentimen global membaik, obligasi negara kebanjiran pembeli. BI diprediksi menahan suku bunga.",
    imageUrl: img(17976414),
    source: "Portal-Hub Bisnis",
    dateLabel: "9 Feb 2026",
  },
  {
    id: 10,
    title: "UMKM Go Digital, Omzet Produk Lokal Naik 3 Kali Lipat",
    category: "Ekonomi",
    excerpt:
      "Pendampingan marketplace lokal dan konten media sosial mendongkrak penjualan madu hutan ke luar pulau.",
    imageUrl: img(38164883),
    source: "Portal-Hub Bisnis",
    dateLabel: "8 Feb 2026",
  },
  {
    id: 11,
    title: "Timnas Tembus Peringkat 118 FIFA, Rekor Tertinggi Sepanjang Sejarah",
    category: "Olahraga",
    excerpt:
      "Konsistensi di kualifikasi membuahkan hasil. Suporter memenuhi stadion untuk merayakan kemenangan terakhir.",
    imageUrl: img(32190714),
    source: "Portal-Hub Sport",
    dateLabel: "8 Feb 2026",
  },
  {
    id: 12,
    title: "AI Generatif Masuk Kurikulum SMK, 500 Sekolah Jadi Percontohan",
    category: "Teknologi",
    excerpt:
      "Fokus pada pemanfaatan AI untuk produktivitas, bukan sekadar teori. Guru mendapat pelatihan intensif.",
    imageUrl: img(34140, "jpg"),
    source: "Portal-Hub Tekno",
    dateLabel: "7 Feb 2026",
  },
  {
    id: 13,
    title: "5 Pantai Tersembunyi untuk Bucket List 2026",
    category: "Lifestyle",
    excerpt:
      "Dari pasir merah hingga teluk sunyi berair jernih — destinasi yang belum terjamah wisatawan massal.",
    imageUrl: img(4239627),
    source: "Portal-Hub Travel",
    dateLabel: "7 Feb 2026",
  },
];

/** Deterministic pseudo-metrics so cards feel alive without hydration issues. */
export const pseudoViews = (id: number) => 1200 + ((id * 937) % 8600);
export const pseudoLikes = (id: number) => 300 + ((id * 613) % 4200);
export const pseudoComments = (id: number) => 40 + ((id * 271) % 900);
export const pseudoShares = (id: number) => 150 + ((id * 449) % 2600);

export const formatCount = (n: number) =>
  n >= 1000
    ? `${(n / 1000).toFixed(1).replace(".", ",").replace(",0", "")} rb`
    : String(n);
