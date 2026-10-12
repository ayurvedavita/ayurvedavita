import Image from "next/image";
import type { ThemeName } from "@/lib/themes";

export function Logo({ theme, size = "md" }: { theme: ThemeName; size?: "md" | "lg" }) {
  if (theme === "original") {
    return <Image src="/images/logo.png" alt="Ayurveda•Vita" width={160} height={70} priority className="h-[70px] w-auto" />;
  }
  return (
    <span className="flex items-center gap-3">
      <Image src="/images/icon.png" alt="" width={52} height={48} priority className={size === "lg" ? "h-14 w-auto" : "h-11 w-auto"} />
      <span
        className={`font-heading text-heading tracking-[0.2em] uppercase ${size === "lg" ? "text-3xl" : "text-xl"}`}
      >
        Ayurveda<span className="text-highlight">·</span>Vita
      </span>
    </span>
  );
}
