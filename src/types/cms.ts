/** Gozmar CMS — shared types (mirrors js/cms-data.js shape) */
export type Media = {
  hero: string;
  gallery: [string, string, string];
  altTexts?: Record<string, string>;
};

export type PricingTier = {
  name: string;
  monthly: string;
  annual: string;
  volumeDiscount: string; // "0" | "15"
  minSeats: string;
  features: string[];
  cta: string;
};

export type Pricing = { tiers: PricingTier[] };

export type Product = {
  navLabel: string;
  tagline: string;
  title: string;
  summary: string;
  ctaPrimary: string;
  detailTitle: string;
  detailIntro: string;
  detailHeading: string;
  detailParagraphs: [string, string] | string[];
  features: string[];
  media: Media;
  pricing: Pricing;
  categoryId?: string;
};

export type HeroSection = {
  title: string;
  titleAccent: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
};
export type AboutSection = { heading: string; text: string; image: string };
export type StatsItem = { number: string; label: string };
export type StatsSection = { items: StatsItem[] };
export type ValueItem = { icon: string; title: string; text: string };
export type ValuesSection = { items: ValueItem[] };
export type TestimonialItem = { quote: string; author: string };
export type TestimonialsSection = { items: TestimonialItem[] };
export type FAQItem = { q: string; a: string };
export type FAQSection = { items: FAQItem[] };
export type ContactSection = { email: string; phone: string; address: string };
export type FooterSection = { brand: string; tagline: string };

export type SiteState = {
  hero: HeroSection;
  about: AboutSection;
  stats: StatsSection;
  values: ValuesSection;
  testimonials: TestimonialsSection;
  faq: FAQSection;
  contact: ContactSection;
  footer: FooterSection;
};

export type CMSState = {
  products: Record<string, Product>;
  site: SiteState;
};

export type DraftState = {
  draft: CMSState;
  published: CMSState;
  isDraft: boolean;
};

export type SectionPath = `products.${string}` | `site.${keyof SiteState}`;
export type ViewMode = "view" | "edit";
