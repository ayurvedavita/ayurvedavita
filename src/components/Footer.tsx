import { site } from "@/lib/site";

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      <h3 className="ui text-2xl mb-5" style={{ fontFamily: "var(--font-ui)" }}>
        {title}
      </h3>
      <div className="text-highlight font-semibold leading-relaxed">{children}</div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 pb-10 border-t border-line pt-16 bg-bg">
      <div className="mx-auto max-w-[1152px] px-4 md:px-6 grid gap-12 md:grid-cols-3">
        <Column title="Locations">
          {site.locations.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </Column>
        <Column title="Hours">
          {site.hours.map((h) => (
            <p key={h}>{h}</p>
          ))}
        </Column>
        <Column title="Contact">
          <p>
            <a href={`mailto:${site.email}`} className="underline">
              {site.email}
            </a>
          </p>
          <p className="font-normal">
            {"INFO // "}
            <a href={site.whatsapp}>{site.phone}</a>
            {" // WhatsApp"}
          </p>
          <p className="font-normal">Think with 🧡</p>
        </Column>
      </div>
      <p className="mt-12 text-center text-xs text-highlight font-semibold">
        Copyright {new Date().getFullYear()} © Ayurveda • Vita
      </p>
    </footer>
  );
}
