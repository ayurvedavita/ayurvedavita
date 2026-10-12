"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    navigator.sendBeacon?.("/api/track", JSON.stringify({ path: pathname }));
  }, [pathname]);
  return null;
}
