import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="admin" className="min-h-screen bg-bg text-text font-body text-[15px] leading-normal">
      {children}
    </div>
  );
}
