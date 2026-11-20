export type BrandSlug = "popbeez" | "nusabeez" | "portal-hub" | "blinkbeez" | "e-beez";

export type BrandInfo = {
  slug: BrandSlug;
  name: string;
  platform: string;
  color: string;
  tagline: string;
  description: string;
  tags: string[];
  ctaLabel: string;
  /** Articles of this category become this brand's news cards. */
  category?: string;
};

export const BRANDS: Record<BrandSlug, BrandInfo> = {
  popbeez: {
    slug: "popbeez",
    name: "PopBeez",
    platform: "Facebook Page",
    color: "#ff4d8d",
    tagline: "News card hiburan Asia yang bikin fans betah scroll.",
    description:
      "PopBeez menyajikan drakor, dracin, idol group, manga, dan donghua dalam format news card yang cepat, ringan, dan sangat mudah dibagikan. Setiap kartu lahir dari topik yang sudah terbukti ramai di Portal-Hub.",
    tags: ["Drakor", "Dracin", "Idol", "Manga", "Donghua"],
    ctaLabel: "Ikuti di Facebook",
    category: "Hiburan",
  },
  nusabeez: {
    slug: "nusabeez",
    name: "NusaBeez",
    platform: "Facebook Page",
    color: "#ff453a",
    tagline: "Kabar nasional, dikemas ringan untuk semua kalangan.",
    description:
      "NusaBeez mengubah berita nasional pilihan dari Portal-Hub menjadi news card visual yang mudah dicerna — tanpa clickbait murahan, tetap enak dibagikan ke grup keluarga.",
    tags: ["Nasional", "Terkini", "Viral"],
    ctaLabel: "Ikuti di Facebook",
    category: "Nasional",
  },
  "portal-hub": {
    slug: "portal-hub",
    name: "Portal-Hub",
    platform: "Website Aggregator",
    color: "#38bdf8",
    tagline: "Agregator berita untuk semua orang.",
    description:
      "Prototipe tampilan agregator berita bergaya MSN & Yahoo. Catatan: situs produksi Anda berada di www.portal-hub.online dan bukan sumber konten bagi PopBeez maupun NusaBeez.",
    tags: ["Agregator", "SEO", "Discover"],
    ctaLabel: "Buka Portal-Hub",
  },
  blinkbeez: {
    slug: "blinkbeez",
    name: "BlinkBeez",
    platform: "YouTube Shorts",
    color: "#a78bfa",
    tagline: "Berita terbaik, dipadatkan jadi 60 detik.",
    description:
      "Kanal YouTube khusus video pendek. Artikel dan news card dengan performa terbaik diangkat menjadi Shorts yang adiktif — menjangkau audiens baru yang tidak aktif di Facebook.",
    tags: ["Shorts", "Retensi", "Visual"],
    ctaLabel: "Tonton di YouTube",
  },
  "e-beez": {
    slug: "e-beez",
    name: "E-Beez",
    platform: "E-Commerce Lokal",
    color: "#34d399",
    tagline: "Marketplace untuk produk lokal pilihan.",
    description:
      "E-Beez adalah tempat audiens setia HiveComp berubah menjadi pelanggan. Produk UMKM pilihan dengan pengiriman lokal dan opsi COD.",
    tags: ["Lokal", "UMKM", "COD"],
    ctaLabel: "Belanja di E-Beez",
  },
};

export const BRAND_SLUGS = Object.keys(BRANDS) as BrandSlug[];

export type Product = {
  name: string;
  price: number;
  unit: string;
  img: string;
  rating: string;
  sold: string;
  location: string;
};

export const E_BEEZ_PRODUCTS: Product[] = [
  {
    name: "Madu Hutan Lokal",
    price: 85000,
    unit: "botol 500ml",
    img: "https://images.pexels.com/photos/38164883/pexels-photo-38164883.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    rating: "4.9",
    sold: "1,2 rb",
    location: "Lokal",
  },
  {
    name: "Kopi Arabika Lokal",
    price: 65000,
    unit: "kemasan 250g",
    img: "https://images.pexels.com/photos/5109705/pexels-photo-5109705.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    rating: "4.8",
    sold: "860",
    location: "Lokal",
  },
  {
    name: "Tenun Ikat Lokal",
    price: 350000,
    unit: "per lembar",
    img: "https://images.pexels.com/photos/18415909/pexels-photo-18415909.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    rating: "5.0",
    sold: "210",
    location: "Lokal",
  },
  {
    name: "VCO Murni Lokal",
    price: 45000,
    unit: "botol 250ml",
    img: "https://images.pexels.com/photos/725998/pexels-photo-725998.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    rating: "4.9",
    sold: "940",
    location: "Lokal",
  },
];