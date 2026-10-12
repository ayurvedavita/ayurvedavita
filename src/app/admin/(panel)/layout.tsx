import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/events", label: "Events & slots" },
  { href: "/admin/bookings", label: "Bookings" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      <header className="bg-[#133124] text-white">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center gap-6 overflow-x-auto">
          <span className="font-semibold whitespace-nowrap">Ayurveda•Vita admin</span>
          <nav className="flex gap-5 text-sm">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="opacity-85 hover:opacity-100 whitespace-nowrap">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <a href="/admin/backup" className="opacity-75 hover:opacity-100 whitespace-nowrap">
              Download backup
            </a>
            <Link href="/" className="opacity-75 hover:opacity-100 whitespace-nowrap">
              View site ↗
            </Link>
            <form action={logout}>
              <button className="opacity-75 hover:opacity-100">Log out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  );
}
