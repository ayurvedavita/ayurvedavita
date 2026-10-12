import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <Image src="/images/icon.png" alt="" width={130} height={120} className="mx-auto mb-10 h-[120px] w-auto" />
      <div className="prose-site text-xl md:text-2xl">
        <p>Ayurveda Vita was born out of a natural process, unhindered by love and trust in 2024.</p>
        <p>
          We are a team, our life’s journey has led us to the desire to share and expand knowledge and experiences, and
          thus to create opportunities for coming together to learn and grow.
        </p>
        <p className="text-highlight font-heading text-3xl mt-10">We love you all and we respect you all!</p>
      </div>
    </div>
  );
}
