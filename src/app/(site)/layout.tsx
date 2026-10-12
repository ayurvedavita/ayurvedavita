import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageViewTracker } from "@/components/PageViewTracker";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { getThemeConfig } from "@/lib/theme-server";
import { CHOOSING_DESIGN } from "@/lib/themes";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const theme = await getThemeConfig();
  return (
    <>
      <Header theme={theme.name} layout={theme.header} />
      <main>{children}</main>
      <Footer />
      <PageViewTracker />
      {CHOOSING_DESIGN && <ThemeSwitcher current={theme.name} />}
    </>
  );
}
