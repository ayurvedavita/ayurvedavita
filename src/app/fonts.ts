import {
  Arima,
  Cormorant,
  DM_Sans,
  Fjalla_One,
  Fraunces,
  Inter,
  Jost,
  Nunito,
  Philosopher,
  Satisfy,
} from "next/font/google";

// Original theme (same fonts as the WordPress site)
const philosopher = Philosopher({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-philosopher" });
const arima = Arima({ subsets: ["latin"], variable: "--font-arima" });
const fjalla = Fjalla_One({ weight: "400", subsets: ["latin"], variable: "--font-fjalla" });
const satisfy = Satisfy({ weight: "400", subsets: ["latin"], variable: "--font-satisfy" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
// Alternative themes, not preloaded
const cormorant = Cormorant({ style: ["normal", "italic"], subsets: ["latin"], variable: "--font-cormorant", preload: false });
const jost = Jost({ subsets: ["latin"], variable: "--font-jost", preload: false });
const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-fraunces", preload: false });
const dmsans = DM_Sans({ subsets: ["latin"], variable: "--font-dmsans", preload: false });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", preload: false });

export const fontVariables = [philosopher, arima, fjalla, satisfy, nunito, cormorant, jost, fraunces, dmsans, inter]
  .map((f) => f.variable)
  .join(" ");
