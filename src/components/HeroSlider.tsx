"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Slide = { image: string; quote: string; title: string };

export function HeroSlider({ slides }: { slides: readonly Slide[] }) {
  const [index, setIndex] = useState(0);
  const go = (delta: number) => setIndex((i) => (i + delta + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length, index]);

  return (
    <section className="relative h-[420px] md:h-[600px] overflow-hidden bg-black">
      {slides.map((s, i) => (
        <div key={s.image} className={`absolute inset-0 transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}>
          <Image src={s.image} alt="" fill priority={i === 0} className="object-cover grayscale" sizes="100vw" />
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <p className="text-white text-2xl md:text-3xl" style={{ fontFamily: "var(--font-script)" }}>
              {s.quote}
            </p>
            <p className="mt-2 text-highlight text-2xl md:text-3xl uppercase" style={{ fontFamily: "var(--font-tagline)" }}>
              {s.title}
            </p>
          </div>
        </div>
      ))}
      <button aria-label="Previous" onClick={() => go(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 text-4xl px-2">
        ‹
      </button>
      <button aria-label="Next" onClick={() => go(1)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 text-4xl px-2">
        ›
      </button>
      <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.image}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2.5 w-2.5 rounded-full ${i === index ? "bg-white" : "bg-highlight"}`}
          />
        ))}
      </div>
    </section>
  );
}
