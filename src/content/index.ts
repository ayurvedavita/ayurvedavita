import type { Event } from "@prisma/client";
import type { SessionView } from "@/lib/queries";
import InternationalAyurvedaRetreat from "./international-ayurveda-retreat";

export type RichContentProps = { event: Event; sessions: SessionView[] };

// Event pages with hand-written content, by slug. Other events use the generic layout.
export const richContent: Record<string, React.ComponentType<RichContentProps>> = {
  "international-ayurveda-retreat": InternationalAyurvedaRetreat,
};
