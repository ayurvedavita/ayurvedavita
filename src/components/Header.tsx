"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/lib/site";
import type { ThemeName } from "@/lib/themes";
import { Logo } from "./Logo";

type Props = { theme: ThemeName; layout: "split" | "centered" };

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return site.nav.map((item) => {
    const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onNavigate}
        className="ui transition-opacity hover:opacity-70"
        style={{ color: active ? "var(--header-active)" : "var(--header-text)" }}
      >
        {item.label}
      </Link>
    );
  });
}

function Cta({ theme }: { theme: ThemeName }) {
  // The original site has a Contact button; the alternatives push booking instead.
  return theme === "original" ? (
    <a href={`mailto:${site.email}`} className="btn">
      Contact
    </a>
  ) : (
    <Link href="/book" className="btn">
      Book a session
    </Link>
  );
}

export function Header({ theme, layout }: Props) {
  const [open, setOpen] = useState(false);
  const burger = (
    <button
      type="button"
      aria-label="Menu"
      onClick={() => setOpen(!open)}
      className="md:hidden p-2"
      style={{ color: "var(--header-text)" }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
      </svg>
    </button>
  );
  const mobileMenu = open && (
    <nav className="md:hidden flex flex-col items-center gap-5 py-6 text-lg border-t border-line">
      <NavLinks onNavigate={() => setOpen(false)} />
      <Cta theme={theme} />
    </nav>
  );

  if (layout === "centered") {
    return (
      <header className="sticky top-0 z-40 border-b border-line" style={{ background: "var(--header-bg)" }}>
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-5 flex items-center justify-between md:justify-center">
          <Link href="/">
            <Logo theme={theme} size="lg" />
          </Link>
          {burger}
        </div>
        <nav className="hidden md:flex justify-center gap-10 pb-4 text-[13px]">
          <NavLinks />
        </nav>
        {mobileMenu}
      </header>
    );
  }

  const navRight = theme !== "original";
  return (
    <header
      className={`sticky top-0 z-40 ${theme === "lumiere" ? "backdrop-blur border-b border-line" : ""}`}
      style={{ background: "var(--header-bg)" }}
    >
      <div className="mx-auto max-w-[1152px] px-4 md:px-6 h-[88px] md:h-[106px] flex items-center justify-between gap-6">
        <Link href="/" className="shrink-0">
          <Logo theme={theme} />
        </Link>
        <nav
          className={`hidden md:flex items-center gap-7 text-[17px] ${navRight ? "ml-auto" : "absolute left-1/2 -translate-x-1/2"}`}
        >
          <NavLinks />
        </nav>
        <div className="hidden md:block">
          <Cta theme={theme} />
        </div>
        {burger}
      </div>
      {mobileMenu}
    </header>
  );
}
