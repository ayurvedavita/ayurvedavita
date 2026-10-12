import { cookies } from "next/headers";
import { CHOOSING_DESIGN, DEFAULT_THEME, THEME_COOKIE, THEMES, isTheme, type ThemeName } from "./themes";

export async function getTheme(): Promise<ThemeName> {
  if (!CHOOSING_DESIGN) return DEFAULT_THEME;
  const value = (await cookies()).get(THEME_COOKIE)?.value;
  return isTheme(value) ? value : DEFAULT_THEME;
}

export async function getThemeConfig() {
  const name = await getTheme();
  return { name, ...THEMES[name] };
}
