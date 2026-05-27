import {
  BarChart3,
  Layers,
  Lock,
  QrCode,
  Sparkles,
  Type,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type FeatureTab = {
  id: string;
  label: string;
  headline: string;
  summary: string;
  items: { icon: LucideIcon; title: string; description: string }[];
};

export const featureTabs: FeatureTab[] = [
  {
    id: "build",
    label: "Build",
    headline: "Draft forms in minutes",
    summary:
      "Start with AI or drag fields onto the canvas — validation and ordering included.",
    items: [
      {
        icon: Sparkles,
        title: "AI form generation",
        description: "Plain-English prompts become fields, labels, and structure.",
      },
      {
        icon: Type,
        title: "Rich field types",
        description: "Text, choice, rating, date, file upload, and more.",
      },
      {
        icon: Zap,
        title: "Conditional logic",
        description: "Show or hide questions based on earlier answers.",
      },
    ],
  },
  {
    id: "brand",
    label: "Brand",
    headline: "Look like your product",
    summary:
      "Themes, access rules, and cover imagery so every form feels on-brand.",
    items: [
      {
        icon: Layers,
        title: "Custom themes",
        description: "Colors, fonts, and layout tuned to your brand.",
      },
      {
        icon: Lock,
        title: "Access controls",
        description: "Passwords, caps, and expiry for sensitive flows.",
      },
      {
        icon: QrCode,
        title: "QR & slugs",
        description: "Memorable links and scannable codes for offline sharing.",
      },
    ],
  },
  {
    id: "grow",
    label: "Grow",
    headline: "Learn what respondents do",
    summary:
      "Analytics, exports, and public explore help you improve every version.",
    items: [
      {
        icon: BarChart3,
        title: "Analytics",
        description: "Views, completions, and trends in one dashboard.",
      },
      {
        icon: QrCode,
        title: "Public explore",
        description: "List forms publicly and grow organic discovery.",
      },
      {
        icon: Sparkles,
        title: "CSV export",
        description: "Download responses on Pro for spreadsheets and BI tools.",
      },
    ],
  },
];

export const workflowSteps = [
  {
    id: "describe",
    step: "01",
    title: "Describe or build",
    description:
      "Start from a prompt with AI or open the visual builder and add fields yourself.",
    detail:
      "Paste a short brief — “customer onboarding with email, team size, and goals” — and get a draft form. Tweak field order, labels, and required flags in the editor.",
  },
  {
    id: "publish",
    step: "02",
    title: "Publish & share",
    description:
      "Set a slug, generate a QR code, or list on Explore so respondents find you fast.",
    detail:
      "One click to go live. Share a branded link, embed a QR on posters, or feature the form on Explore for organic traffic.",
  },
  {
    id: "iterate",
    step: "03",
    title: "Learn & iterate",
    description:
      "Watch completion rates, export responses, and refine the next version with real data.",
    detail:
      "See where people drop off, export CSV on Pro, and ship v2 with fewer fields or clearer copy — backed by numbers, not guesses.",
  },
];

export type PricingTier = {
  id: string;
  name: string;
  monthlyPrice: number | null;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
};

export const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    description: "For personal projects and trying out FormCraft.",
    features: [
      "3 active forms",
      "100 responses / month",
      "Basic themes",
      "Email notifications",
    ],
    cta: "Get started",
    href: "/register",
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 19,
    description: "For growing teams that need more power.",
    features: [
      "Unlimited forms",
      "10,000 responses / month",
      "AI form generation",
      "Custom themes & branding",
      "Analytics & CSV export",
    ],
    cta: "Start free trial",
    href: "/register",
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: null,
    description: "For organizations with advanced security needs.",
    features: [
      "Everything in Pro",
      "SSO & SAML",
      "Dedicated support",
      "SLA",
      "Custom integrations",
    ],
    cta: "Contact sales",
    href: "mailto:sales@formcraft.io",
  },
];

export const faqs = [
  {
    q: "Can I use the demo account?",
    a: "Yes. Sign in with demo@formcraft.io / Demo@1234 to explore the full product.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Pro annual plans save 20%. Contact us for Enterprise annual contracts.",
  },
  {
    q: "What happens when I hit response limits?",
    a: "Forms stay live but new responses pause until you upgrade or the next billing cycle.",
  },
  {
    q: "Can I export my data?",
    a: "Pro and Enterprise plans include CSV and JSON export for all responses.",
  },
];

export const homeSections = [
  { id: "features", label: "Features" },
  { id: "workflow", label: "Workflow" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
] as const;
