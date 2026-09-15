import type { FormatOption, Plan, StyleOption, TemplateCategory } from "@/types";

export const FORMATS: FormatOption[] = [
  { id: "square-1-1", label: "Post 1:1", group: "Instagram", width: 1080, height: 1080, ratioLabel: "1:1" },
  { id: "portrait-4-5", label: "Portrait 4:5", group: "Instagram", width: 1080, height: 1350, ratioLabel: "4:5" },
  { id: "landscape-1.91-1", label: "Landscape 1.91:1", group: "Instagram", width: 1080, height: 566, ratioLabel: "1.91:1" },
  { id: "story-9-16", label: "Story 9:16", group: "Instagram", width: 1080, height: 1920, ratioLabel: "9:16" },
  { id: "reel-cover-9-16", label: "Reel Cover 9:16", group: "Instagram", width: 1080, height: 1920, ratioLabel: "9:16" },
  { id: "youtube-thumbnail", label: "YouTube Thumbnail", group: "Other", width: 1280, height: 720, ratioLabel: "16:9" },
  { id: "linkedin", label: "LinkedIn", group: "Other", width: 1200, height: 627, ratioLabel: "1.91:1" },
  { id: "x-post", label: "X", group: "Other", width: 1600, height: 900, ratioLabel: "16:9" },
  { id: "facebook", label: "Facebook", group: "Other", width: 1200, height: 630, ratioLabel: "1.91:1" },
  { id: "custom", label: "Custom", group: "Other", width: 1080, height: 1080, ratioLabel: "Custom" },
];

export const CAROUSEL_FORMAT: FormatOption = {
  id: "portrait-4-5",
  label: "Carousel 4:5",
  group: "Instagram",
  width: 1080,
  height: 1350,
  ratioLabel: "4:5",
};

export const STYLES: StyleOption[] = [
  { id: "minimalist-premium", label: "Minimalist Premium", description: "Clean layouts, generous negative space, restrained palette." },
  { id: "bold-editorial", label: "Bold Editorial", description: "High contrast, dramatic type, magazine energy." },
  { id: "tech-futuristic", label: "Tech Futuristic", description: "Dark surfaces, glow accents, precision grids." },
  { id: "warm-organic", label: "Warm Organic", description: "Soft light, natural textures, approachable tone." },
  { id: "photographic", label: "Photographic", description: "Realistic lighting and depth, lifestyle-grade imagery." },
  { id: "vibrant-playful", label: "Vibrant Playful", description: "Saturated color, energetic shapes, friendly type." },
];

export const QUALITY_OPTIONS = [
  { id: "draft", label: "Draft", description: "Fastest, lower fidelity — good for exploring ideas." },
  { id: "standard", label: "Standard", description: "Balanced quality and speed." },
  { id: "high", label: "High", description: "Maximum fidelity — best for final exports." },
] as const;

export const QUICK_ACTIONS = [
  { id: "post", label: "Instagram Post", type: "post", format: "square-1-1" },
  { id: "carousel", label: "Instagram Carousel", type: "carousel", format: "portrait-4-5" },
  { id: "ad", label: "Ad Creative", type: "ad", format: "square-1-1" },
  { id: "story", label: "Story", type: "story", format: "story-9-16" },
  { id: "thumbnail", label: "Thumbnail", type: "thumbnail", format: "youtube-thumbnail" },
  { id: "custom", label: "Custom Image", type: "custom", format: "custom" },
] as const;

export const EXAMPLE_PROMPTS = [
  "A minimalist Instagram post announcing a product launch, dark background, bold white typography, premium tech aesthetic.",
  "Crie um carrossel de 7 slides sobre os 5 erros que empreendedores cometem ao usar inteligência artificial. Estilo minimalista e premium, fundo escuro.",
  "An ad creative for a fitness app, energetic and vibrant, showing motion and confidence, bold CTA space.",
  "A LinkedIn cover image for a startup founder, professional and modern, subtle gradient, clean typography.",
];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  "Business",
  "Marketing",
  "Technology",
  "Finance",
  "Education",
  "Fitness",
  "Personal Brand",
  "Real Estate",
  "Food",
  "Fashion",
  "AI",
  "Startup",
];

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    credits: 100,
    priceMonthly: 0,
    description: "Explore Kogni and create your first visuals.",
    features: ["100 credits / month", "Instagram posts & carousels", "Standard quality", "Community templates"],
  },
  {
    id: "pro",
    name: "Pro",
    credits: 1000,
    priceMonthly: 29,
    description: "For creators and marketers shipping content weekly.",
    features: ["1,000 credits / month", "High quality generations", "Brand Kit", "Priority generation queue"],
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    credits: 5000,
    priceMonthly: 99,
    description: "For teams producing content at scale.",
    features: ["5,000 credits / month", "Team workspaces (soon)", "Advanced brand controls", "Priority support"],
  },
];

export const GENERATION_STEPS = [
  "Understanding your idea",
  "Designing the composition",
  "Generating your visual",
  "Adding final details",
] as const;
