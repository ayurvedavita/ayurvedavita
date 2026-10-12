import { THEMES, type ThemeName } from "@/lib/themes";

// Shown only while CHOOSING_DESIGN is true (src/lib/themes.ts).
// The links go through proxy.ts, which stores the choice in a cookie.
export function ThemeSwitcher({ current }: { current: ThemeName }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 rounded-full bg-black/80 p-1 text-[13px] text-white shadow-xl backdrop-blur">
      <span className="px-3 opacity-70 hidden sm:inline">Design</span>
      {(Object.keys(THEMES) as ThemeName[]).map((name) => (
        <a
          key={name}
          href={`?theme=${name}`}
          className={`rounded-full px-3 py-1.5 transition ${name === current ? "bg-white text-black" : "hover:bg-white/15"}`}
        >
          {THEMES[name].label}
        </a>
      ))}
    </div>
  );
}
