import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, MessageCircle, ShieldCheck } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import HiveIdentity from "@/components/hive-identity";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privasi & Disclaimer — HiveComp",
  description: "Ringkasan penggunaan data pribadi, hak pengunjung, dan batasan informasi pada situs HiveComp.",
  alternates: { canonical: "https://www.hivecomp.my.id/kebijakan" },
};

const PRIVACY = [
  {
    title: "Data & tujuan",
    text: "Formulir mencatat nama, email atau nomor WhatsApp, minat kerja sama, dan pesan Anda. Data ini digunakan untuk membalas dan menindaklanjuti permintaan, bukan untuk dijual atau dikirim sebagai promosi tanpa persetujuan.",
  },
  {
    title: "Penyimpanan & layanan pendukung",
    text: "Pesan disimpan di database dan diakses melalui panel admin. Layanan hosting dan database membantu memprosesnya. Jika notifikasi WhatsApp diaktifkan, ringkasan pesan diteruskan melalui penyedia notifikasi yang digunakan pengelola. Hindari mengirim kata sandi atau data sensitif.",
  },
  {
    title: "Analitik & keamanan",
    text: "Vercel Analytics dan Speed Insights digunakan untuk mengukur kunjungan serta performa situs. Alamat IP diproses sementara untuk membatasi spam. Cookie sesi digunakan untuk login admin; tautan WhatsApp dan situs lain mengikuti kebijakan layanan masing-masing.",
  },
  {
    title: "Hak atas data Anda",
    text: "Anda dapat meminta akses, koreksi, atau penghapusan pesan melalui kontak di bawah. Kami dapat meminta verifikasi untuk memastikan permintaan berasal dari pemilik data. Penyimpanan ditinjau sesuai kebutuhan tindak lanjut dan kewajiban yang berlaku.",
  },
];

const DISCLAIMER = [
  "Informasi di situs ini merupakan pengenalan brand dan layanan yang dapat diperbarui sewaktu-waktu. Angka pada bagian target adalah sasaran internal, bukan capaian saat ini maupun jaminan hasil.",
  "Postingan dan statistik kanal bersumber dari platform resmi masing-masing brand. Karena pembaruan berkala, angkanya dapat berbeda dari yang tampil di platform asal.",
  "Produk dan situs yang ditautkan memiliki ketentuan tersendiri. Harga, transaksi, serta kesepakatan kerja sama dikonfirmasi langsung dengan pengelola layanan terkait.",
  "Nama, logo, dan materi pihak lain tetap menjadi hak pemiliknya. Hubungi kami untuk koreksi informasi atau pelaporan hak atas materi.",
];

export default async function PolicyPage() {
  const site = await getSettings();
  const whatsapp = buildWhatsAppUrl(site.contact.whatsapp, "Halo HiveComp, saya ingin menanyakan kebijakan situs atau data pribadi saya.");

  return (
    <main id="konten" className="min-h-svh bg-ink text-stone-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex min-h-[76px] max-w-4xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="group flex items-center gap-2.5" aria-label="HiveComp — beranda"><HiveIdentity logo={site.hiveLogo} /></Link>
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-stone-400 transition-colors hover:text-hive"><ArrowLeft className="h-3.5 w-3.5" /> Beranda</Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-hive"><ShieldCheck className="h-3.5 w-3.5" /> Kebijakan situs</p>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-5xl">Privasi &amp; <span className="text-hive">Disclaimer</span></h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone-400">Cara kami menggunakan data Anda dan hal yang perlu diketahui saat mengakses situs ini.</p>
        <nav aria-label="Bagian kebijakan" className="mt-6 flex flex-wrap gap-2">
          {[{ href: "#privasi", text: "Privasi" }, { href: "#disclaimer", text: "Disclaimer" }, { href: "#hubungi", text: "Hubungi kami" }].map((item) => <a key={item.href} href={item.href} className="rounded-full border border-white/15 px-4 py-2 text-xs text-stone-300 transition-colors hover:border-hive hover:text-hive">{item.text}</a>)}
        </nav>

        <section id="privasi" aria-labelledby="judul-privasi" className="mt-10 rounded-2xl border border-white/10 bg-coal p-6 sm:p-8">
          <h2 id="judul-privasi" className="font-display text-xl font-semibold">Kebijakan Privasi</h2>
          <dl className="mt-5 space-y-5">{PRIVACY.map((item) => <div key={item.title}><dt className="text-sm font-semibold text-stone-200">{item.title}</dt><dd className="mt-1.5 text-sm leading-relaxed text-stone-400">{item.text}</dd></div>)}</dl>
        </section>

        <section id="disclaimer" aria-labelledby="judul-disclaimer" className="mt-5 rounded-2xl border border-white/10 bg-coal p-6 sm:p-8">
          <h2 id="judul-disclaimer" className="font-display text-xl font-semibold">Disclaimer</h2>
          <ul className="mt-5 list-disc space-y-3 pl-4 text-sm leading-relaxed text-stone-400">{DISCLAIMER.map((text) => <li key={text}>{text}</li>)}</ul>
        </section>

        <section id="hubungi" aria-labelledby="judul-hubungi" className="mt-5 rounded-2xl border border-hive/20 bg-hive/[0.04] p-6 sm:p-8">
          <h2 id="judul-hubungi" className="font-display text-lg font-semibold">Pertanyaan atau permintaan terkait data?</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-400">Sampaikan lewat formulir kontak atau saluran resmi yang tersedia. Sebutkan pesan yang ingin Anda periksa agar kami dapat menindaklanjutinya.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/#kontak" className="inline-flex items-center gap-2 rounded-full bg-hive px-5 py-3 text-xs font-semibold text-ink transition-colors hover:bg-hive-soft">Hubungi HiveComp <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            {site.contact.email && <a href={`mailto:${site.contact.email}`} className="inline-flex items-center rounded-full border border-white/15 px-5 py-3 text-xs text-stone-300 transition-colors hover:border-hive hover:text-hive">{site.contact.email}</a>}
            {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-ebeez/30 px-5 py-3 text-xs text-ebeez transition-colors hover:bg-ebeez/10"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>}
          </div>
        </section>
      </div>
    </main>
  );
}
