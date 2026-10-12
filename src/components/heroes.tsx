import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import { HeroSlider } from "./HeroSlider";

export function Hero({ variant }: { variant: "slider" | "split" | "editorial" | "full" }) {
  if (variant === "slider") return <HeroSlider slides={site.slides} />;
  if (variant === "split") return <HeroSplit />;
  if (variant === "editorial") return <HeroEditorial />;
  return <HeroFull />;
}

function HeroSplit() {
  return (
    <section className="mx-auto max-w-6xl px-4 md:px-6 py-14 md:py-24 grid md:grid-cols-[1.1fr_1fr] gap-12 items-center">
      <div>
        <p className="ui text-xs text-highlight mb-6">Retreats · Courses · Consultations</p>
        <h1 className="text-5xl md:text-7xl font-medium leading-[1.05]">
          The art of living in <em className="text-highlight">harmony</em> and balance
        </h1>
        <p className="mt-8 text-lg text-muted max-w-md">
          Ancient Ayurvedic wisdom, shared in the Swiss mountains and beyond. Learn to listen to your body, eat for your
          dosha and find a quiet mind.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/book" className="btn">
            Book a session
          </Link>
          <Link href="/retreats" className="btn btn-ghost">
            Our retreats
          </Link>
        </div>
      </div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-full border border-line">
        <Image src="/images/meditation.jpg" alt="Meditation group" fill priority className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
      </div>
    </section>
  );
}

function HeroEditorial() {
  const tiles = [
    { src: "/images/meal.jpg", label: "Sattvic food" },
    { src: "/images/resting.jpg", label: "Rest & routine" },
    { src: "/images/glacier-color.jpg", label: "Mountain air" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 md:px-6 pt-14 md:pt-20 pb-10 text-center">
      <p className="ui text-sm text-highlight mb-5">Ayurveda • Vita</p>
      <h1 className="text-5xl md:text-7xl font-semibold tracking-tight">
        Ancient remedies <span className="italic font-normal text-highlight">for modern time</span>
      </h1>
      <p className="mt-6 text-lg text-muted max-w-2xl mx-auto">
        Retreats, courses and one to one consultations to bring Ayurveda into your daily life.
      </p>
      <div className="mt-8 flex justify-center gap-3 flex-wrap">
        <Link href="/book" className="btn">
          See the calendar
        </Link>
        <a href={`mailto:${site.email}`} className="btn btn-ghost">
          Ask us anything
        </a>
      </div>
      <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {tiles.map((t, i) => (
          <figure key={t.src} className={i === 1 ? "sm:-translate-y-6" : ""}>
            <div className="relative aspect-[3/4] overflow-hidden" style={{ borderRadius: "var(--radius)" }}>
              <Image src={t.src} alt={t.label} fill className="object-cover" sizes="(min-width: 640px) 33vw, 100vw" />
            </div>
            <figcaption className="mt-3 text-sm text-muted">{t.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function HeroFull() {
  return (
    <section className="relative h-[78vh] min-h-[520px]">
      <Image src="/images/glacier-color.jpg" alt="Swiss glacier" fill priority className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
      <div className="relative h-full mx-auto max-w-[1152px] px-4 md:px-6 flex flex-col justify-end pb-16 md:pb-24 text-white">
        <p className="text-sm uppercase tracking-[0.25em] opacity-80 mb-4">Churwalden · Switzerland</p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight !text-white max-w-3xl">Ayurveda, in the heart of the Alps.</h1>
        <p className="mt-5 text-lg max-w-xl opacity-90">Retreats, courses and private consultations. Book online in two minutes.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/book" className="btn !bg-white !text-black">
            Book a session
          </Link>
          <Link href="/retreats" className="btn !bg-transparent !text-white border border-white/50">
            Discover the retreat
          </Link>
        </div>
      </div>
    </section>
  );
}
