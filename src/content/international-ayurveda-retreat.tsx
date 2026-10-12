import Image from "next/image";
import { Dots, Partners, PriceButtons, retreatDateLine } from "@/components/blocks";
import { site } from "@/lib/site";
import type { RichContentProps } from ".";
import { RetreatProgram, type ProgramDay } from "./RetreatProgram";

const overview: [string, string][] = [
  ["MARMA", "The ancient Art and Science of Energy Points, how to release mental and physical blocks and harmonize the energy flow."],
  ["HOME REMEDIES", "Simple, effective recipes with herbs and spices from the kitchen."],
  ["FOOD", "What to eat and what to avoid, tailored to your individual constitution."],
  ["LIFESTYLE", "Daily Routines and habits that protect your health in the long term."],
  ["HERBAL REMEDIES", "The power of Ayurvedic herbs and their use for various health challenges"],
  ["PANCHAKARMA", "Ayurveda’s special detox program, basics and preparation for greater lightness."],
  ["YOGA", "A discipline which promote good health and the control of the body, mind and emotions."],
  ["DIET", "Perfect combination of food and spices to balance the dosha"],
  ["MIND-WORK", "Effective tools that can change your life"],
];

const food: [string, string][] = [
  [
    "The Benefits of Eating Healthy Food in Ayurveda",
    "Ayurveda teaches that every person has the power to heal themselves. In this way, this ancient healing tradition offers everyone the opportunity to restore their health by understanding their body and its needs.",
  ],
  [
    "Nourishment as the Foundation of Harmony",
    "Food provides the essential elements to nourish the body, mind, and soul in the most balanced way possible. Ayurveda emphasizes that proper nutrition not only satisfies hunger but also fosters inner harmony.",
  ],
  [
    "The Importance of Seasonal Alignment",
    "Each season is governed by a predominant dosha. To honor your unique constitution, it is important to adapt your diet according to the season. Inappropriate foods can become harmful over time if consumed consistently.",
  ],
];

const team: { name: string; role: string; bio: string }[] = [
  {
    name: "Dr. Giovanni Brincivalli",
    role: "Expert in the Ancient Healing Secrets of Siddha Veda, from Italy.",
    bio: "Through his Ayurvedic practice, Dr. Giovanni Brincivalli helps restore movements where these natural kinetics have been disrupted, allowing the body’s own innate intelligence to heal, adapt and thrive.",
  },
  {
    name: "Vai. Sandhya Okada",
    role: "B.A.M.S. (Bachelor of Ayurveda Medicine and Surgery), from Japan.",
    bio: "Through her years of practice and deep grounding in Ayurveda and SiddhaVeda, Vaidya Sandhya Okada helps restore balance with compassion, guiding individuals towards greater well-being, vitality and inner harmony.",
  },
  {
    name: "Gana KC",
    role: "Holistic Yoga Educator, from India.",
    bio: "Through authentic, traditional practice, Gana KC creates a nurturing space where individuals can reconnect with themselves, cultivate inner stability and grow from a place of deep grounding.",
  },
  {
    name: "Annuji",
    role: "Ayurvedic Chef, from Italy.",
    bio: "Through Sattvic cooking, Annunziata Violante honours this timeless principle, creating food that supports digestion, vitality and the body’s natural capacity to restore and renew.",
  },
  {
    name: "Anil Sehgal",
    role: "NLP Trainer and Coach, from India.",
    bio: "Through Transformative Coaching, Systems Thinking and Powerful Metaphors, Anil Sehgal helps create the space to question assumptions, discover deeper patterns and unlock the innate wisdom that already exists within every individual.",
  },
];

const program: ProgramDay[] = [
  {
    title: "Day 1 /// Welcome day",
    items: [
      ["01. PM", "Arrival / Checkin"],
      ["02. PM", "Introduction"],
      ["03. PM", "Settle in, get the room, chat"],
      ["04. PM", "Introduction to Ayurveda and Siddha Veda"],
      ["05. PM", "Topic: Vata, Pitta, Kapha"],
      ["06. PM", "Foundations of Yoga"],
      ["07. PM", "Dinner"],
      ["08. PM", "Meditation: Cultivating Inner Stillness"],
    ],
  },
  {
    title: "Day 2 /// Dosha focus ~ Kapha•Pitta",
    items: [
      ["06. AM", "Traditional Hatha Yoga"],
      ["07. AM", "Energy Breakfast"],
      ["08. AM", "Mind Work"],
      ["10. AM", "Know your Dosha – Introduction to 6 instruments of Siddha Veda"],
      ["11. AM", "Ayurvedic Diet and Nutrition"],
      ["12. PM", "Cooking Class"],
      ["01. PM", "Lunch"],
      ["02. PM", "Rest"],
      ["03. PM", "Diet and Life Style"],
      ["05. PM", "Mind Work"],
      ["06. PM", "Cooking Class"],
      ["07. PM", "Dinner"],
      ["08. PM", "Rest"],
      ["09. PM", "Candle Gazing: A Yogic Cleansing Meditation"],
    ],
  },
  {
    title: "Day 3 /// Dosha focus ~ Pitta•Vata",
    items: [
      ["06. AM", "Pranayama – Art of Breath Control"],
      ["07. AM", "Energy Breakfast"],
      ["08. AM", "Mind Work"],
      ["10. AM", "Marma and Home Remedies"],
      ["12. PM", "Cooking Class"],
      ["01. PM", "Lunch"],
      ["02. PM", "Rest"],
      ["03. PM", "Home Remedies and Introduction to Panchakarma"],
      ["05. PM", "Mudra Meditation"],
      ["06. PM", "Cooking Class"],
      ["07. PM", "Dinner"],
      ["08. PM", "“The hands of life” Ancient healing secrets – Documentary Film"],
    ],
  },
  {
    title: "Day 4 /// Dosha focus ~ Vata",
    items: [
      ["06. AM", "Reflection and Integration"],
      ["07. AM", "Energy Breakfast"],
      ["08. AM", "Questions & Answers"],
      ["11. AM", "Mind Work"],
      ["12. PM", "Cooking Class"],
      ["01. PM", "Lunch"],
      ["02. PM", "Conclusion"],
      ["03. PM", "Departure /// Check-out"],
    ],
  },
];

function Photo({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ borderRadius: "var(--radius)" }}>
      <Image src={src} alt={alt} fill className="object-cover" sizes="(min-width: 768px) 40vw, 100vw" />
    </div>
  );
}

export default function InternationalAyurvedaRetreat({ event, sessions }: RichContentProps) {
  const next = sessions[0];
  return (
    <article className="pb-10">
      <div className="mx-auto max-w-[800px] px-4 pt-14 text-center">
        <h1 className="text-5xl md:text-6xl">{event.title}</h1>
        <Photo src="/images/lotus.jpg" alt="Lotus" className="aspect-[4/3] mt-12" />
        <h2 className="mt-12 text-3xl md:text-5xl font-semibold">
          Ayurveda and its 6 instruments,
          <br /> Yoga, Diet & Cooking, Mind-skill
        </h2>
        {next && <p className="mt-6 text-xl uppercase">{retreatDateLine(next)}</p>}
        {next && (
          <a href="#book" className="btn mt-6">
            Join us
          </a>
        )}
      </div>

      <div className="mx-auto max-w-[720px] px-4 mt-10 prose-site">
        <h3 className="text-center text-3xl text-highlight! mb-6 font-semibold">JOIN US</h3>
        <p>
          Immerse yourself in ancient wisdom of Ayurveda and discover the 6 instruments of deep healing: Marma, Home
          Remedies, Diet, Lifestyle, Herbal Remedies, and Panchakarma.
        </p>
        <p>
          In this 4 days retreat, you’ll learn how to integrate the wisdom of Ayurveda into your daily life to promote
          Vibrant Health, Unlimited Energy and Peace of Mind.
        </p>
        <h3 className="text-center text-3xl text-highlight! my-6 font-semibold">BENEFITS</h3>
        <p>
          Ayurveda is an ancient healing traditional system focuses on promoting wellness of body, mind and emotions.
          The holistic approach combines lifestyle changes, diet, exercise and mind set. The people who live ayurvedic
          life, report several proven benefits on the acute and chronic problems, like:{" "}
          <strong>
            blood pressure balance, improving vitality, purifying and detoxifying the body, boosting mental health,
            improving digestion, aiding weight loss, improving skin problems, arthritis, osteoarthritis, depression,
            anxiety, joints pain and many more
          </strong>
          .
        </p>
        <p>
          <strong>OUR TEAM</strong> will share with you the practical tools to take charge of your own health and people
          around you, and to use them also in your professional practice.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-4 my-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Photo src="/images/resting.jpg" alt="Resting time" className="aspect-square" />
        <Photo src="/images/meditation.jpg" alt="Meditation" className="aspect-square" />
        <Photo src="/images/glacier-color.jpg" alt="Swiss glacier" className="aspect-square" />
        <Photo src="/images/meal.jpg" alt="Ayurvedic meal" className="aspect-square" />
      </div>

      <div className="mx-auto max-w-[720px] px-4 prose-site">
        <h2 className="text-5xl mb-6">Overview</h2>
        <p>
          The core of the course is an immersion into the Ayurveda with the goal for everyone to gain something
          valuable, to learn about personal dosha, to find a suitable diet, and experience how meditation, yoga and a
          quiet mind can help to stay in harmony.
        </p>
        {overview.map(([title, text]) => (
          <p key={title}>
            <strong>{title}</strong> _ {text}
          </p>
        ))}

        <h2 className="text-5xl mt-12 mb-6">Food</h2>
        {food.map(([title, text]) => (
          <p key={title}>
            <strong>{title}</strong>. {text}
          </p>
        ))}

        <h2 className="text-5xl mt-12 mb-8">Team</h2>
        {team.map((m) => (
          <div key={m.name} className="mb-10">
            <h3 className="text-2xl uppercase">{m.name}</h3>
            <div className="md:pl-48 mt-4">
              <p>
                <strong>{m.role}</strong>
              </p>
              <p>{m.bio}</p>
            </div>
          </div>
        ))}
      </div>

      <Dots />

      <div className="mx-auto max-w-[720px] px-4 prose-site">
        <h2 className="text-5xl mb-6">Location</h2>
        <h3 className="text-4xl font-semibold mb-6">Lindenhof, Churwalden, Switzerland</h3>
        <p>
          At the Lindenhof you will find the ideal environment to relax and to enjoy the breathtaking mountain landscape
          of Graubünden.
        </p>
        <p>INFO Retreat: +39.3400024662 / +39.376.1758366 / WHATSAPP</p>
        <p>Address: Lindawäg 17 – 7075 Churwalden – Graubünden – Switzerland</p>
        <p>
          Web:{" "}
          <a href="https://www.lindenhofchurwalden.ch" className="text-highlight underline">
            https://www.lindenhofchurwalden.ch
          </a>
        </p>
      </div>
      <div className="mx-auto max-w-5xl px-4 my-10 grid grid-cols-2 md:grid-cols-3 gap-4">
        <Photo src="/images/hotel.jpg" alt="Hotel Lindenhof" className="aspect-[4/3] col-span-2 md:col-span-1" />
        <Photo src="/images/lindenhof-1.jpg" alt="Lindenhof" className="aspect-[4/3]" />
        <Photo src="/images/lindenhof-2.jpg" alt="Lindenhof" className="aspect-[4/3]" />
        <Photo src="/images/lindenhof-3.jpg" alt="Lindenhof" className="aspect-[4/3]" />
        <Photo src="/images/lindenhof-4.jpg" alt="Lindenhof" className="aspect-[4/3]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 mt-16">
        <h2 className="text-5xl mb-6 mx-auto max-w-[720px]">Program</h2>
        <RetreatProgram days={program} />
      </div>

      <Dots />

      <div id="book" className="mx-auto max-w-[720px] px-4 text-center scroll-mt-32">
        {next ? (
          <>
            <h2 className="text-4xl font-semibold mb-2">Max {next.capacity} people</h2>
            <p className="text-muted mb-6">{next.spotsLeft} spots left</p>
            <div className="flex flex-col gap-3">
              <PriceButtons session={next} />
            </div>
          </>
        ) : (
          <p>
            New dates coming soon. <a href={`mailto:${site.email}`} className="underline">Write to us</a>.
          </p>
        )}
      </div>

      <Dots />
      <Partners title="This event is organized in collaboration with" />
    </article>
  );
}
