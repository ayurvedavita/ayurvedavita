import type { NextConfig } from "next";

// Browser protections sent with every page.
const securityHeaders = [
  // Forces https for two years once the visitor has seen the site over https.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  // No other site may show these pages inside a frame (stops click-jacking on the admin and booking pages).
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self' https://checkout.stripe.com",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // Admin pages and booking confirmations contain personal data: never store them in shared caches.
      { source: "/admin/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
      { source: "/booking/:path*", headers: [{ key: "Cache-Control", value: "private, no-store" }] },
    ];
  },
  // Old WordPress URLs that may already be shared.
  async redirects() {
    return [{ source: "/international-ayurveda-retreat", destination: "/events/international-ayurveda-retreat", permanent: true }];
  },
};

export default nextConfig;
