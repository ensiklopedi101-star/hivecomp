import { getSettings } from "@/lib/settings";
import { getShowcaseData } from "@/lib/showcase";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import Marquee from "@/components/marquee";
import Ecosystem from "@/components/ecosystem";
import Showcase from "@/components/showcase";
import Flywheel from "@/components/flywheel";
import Partnership from "@/components/partnership";
import Stats from "@/components/stats";
import Contact from "@/components/contact";
import Footer from "@/components/footer";
import SmoothScroll from "@/components/smooth-scroll";
import SiteChrome from "@/components/site-chrome";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [s, showcase] = await Promise.all([getSettings(), getShowcaseData()]);
  return (
    <main id="konten" className="relative">
      <SmoothScroll />
      <SiteChrome />
      <Navbar hiveLogo={s.hiveLogo} />
      <Hero hero={s.hero} whatsapp={s.contact.whatsapp} />
      <Marquee />
      <Ecosystem urls={s.urls} logos={s.logos} instagram={s.instagram} />
      <Showcase urls={s.urls} logos={s.logos} instagram={s.instagram} data={showcase} />
      <Flywheel />
      <Partnership />
      <Stats targets={s.targets} />
      <Contact contact={s.contact} socials={s.socials} />
      <Footer urls={s.urls} hiveLogo={s.hiveLogo} />
    </main>
  );
}
