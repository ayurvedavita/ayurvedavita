// Site-wide content. Edit here to change contact details, footer, home slider or partners.
export const site = {
  name: "Ayurveda•Vita",
  email: "ayurveda.vita@protonmail.com",
  phone: "+39 340 002 4662",
  whatsapp: "https://wa.me/393400024662",
  locations: ["Switzerland /// Sardinia", "Italia /// India /// Greece"],
  hours: ["Monday – Friday", "10am – 4pm", "Europe TIME"],
  nav: [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/retreats", label: "Retreats" },
    { href: "/book", label: "Book" },
    { href: "/about", label: "About" },
  ],
  slides: [
    { image: "/images/hero-glacier.jpg", quote: "Every day is a new possibility", title: "Be simple" },
    { image: "/images/hero-calm.jpg", quote: "Have a wisdom in your action and faith in your merits", title: "Be open and honest" },
    { image: "/images/hero-spices.jpg", quote: "Make the inner peace happen", title: "Kindness is the gift of life" },
    { image: "/images/hero-food.jpg", quote: "Ancient remedies for modern time", title: "Let's your heart guide you" },
    { image: "/images/hero-yoga.jpg", quote: "The art of living in harmony and balance", title: "Yoga is to identify your self" },
  ],
  partners: [
    { name: "Ayurveda Paradies", logo: "/images/partner-ayurveda-paradies.png", url: "https://www.ayurveda-paradies.ch/" },
    { name: "gesund.ch", logo: "/images/partner-gesund.png", url: "https://www.gesund.ch/" },
    { name: "Ölkologisch", logo: "/images/partner-oelkologisch.png", url: "https://oelkologisch.ch/" },
    { name: "Sonnentor", logo: "/images/partner-sonnentor.png", url: "https://www.sonnentor.com/" },
  ],
} as const;

export const KIND_LABELS: Record<string, string> = {
  RETREAT: "Retreat",
  COURSE: "Course",
  CLINIC: "Clinic",
};
