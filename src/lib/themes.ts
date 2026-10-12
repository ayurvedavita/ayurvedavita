// Public site look.
// While CHOOSING_DESIGN is true, a bar at the bottom of the site switches between the designs.
// Once the owner has chosen: set DEFAULT_THEME to the chosen design and CHOOSING_DESIGN to false.
export const CHOOSING_DESIGN = true;

export const THEMES = {
  original: { label: "Original", header: "split", hero: "slider" },
  sable: { label: "Sable", header: "centered", hero: "split" },
  terre: { label: "Terre", header: "split", hero: "editorial" },
  lumiere: { label: "Lumière", header: "split", hero: "full" },
} as const;

export type ThemeName = keyof typeof THEMES;
export const DEFAULT_THEME: ThemeName = "original";
export const THEME_COOKIE = "av_theme";

export function isTheme(value: unknown): value is ThemeName {
  return typeof value === "string" && value in THEMES;
}
