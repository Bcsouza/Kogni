// Core domain types shared across the app, API routes and the AI provider layer.

export type ProjectType = "post" | "carousel" | "ad" | "story" | "thumbnail" | "custom";

export type GenerationStatus =
  | "queued"
  | "understanding"
  | "composing"
  | "generating"
  | "finishing"
  | "completed"
  | "failed";

export type AspectRatioId =
  | "square-1-1"
  | "portrait-4-5"
  | "landscape-1.91-1"
  | "story-9-16"
  | "reel-cover-9-16"
  | "youtube-thumbnail"
  | "linkedin"
  | "x-post"
  | "facebook"
  | "custom";

export interface FormatOption {
  id: AspectRatioId;
  label: string;
  group: "Instagram" | "Other";
  width: number;
  height: number;
  ratioLabel: string;
}

export interface StyleOption {
  id: string;
  label: string;
  description: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  type: ProjectType;
  prompt: string;
  format: AspectRatioId;
  status: GenerationStatus;
  coverImageUrl: string | null;
  model: string;
  creditsConsumed: number;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectAsset {
  id: string;
  projectId: string;
  url: string;
  width: number;
  height: number;
  isSelected: boolean;
  createdAt: string;
}

export interface CarouselSlide {
  id: string;
  carouselId: string;
  position: number;
  role: SlideRole;
  headline: string;
  body: string;
  imageUrl: string | null;
  prompt: string;
  status: GenerationStatus;
}

export type SlideRole =
  | "hook"
  | "problem"
  | "context"
  | "insight"
  | "example"
  | "solution"
  | "cta"
  | "conclusion";

export interface Carousel {
  id: string;
  projectId: string;
  slideCount: number;
  audience: string | null;
  tone: string | null;
  slides: CarouselSlide[];
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  slideCount: number | null;
  style: string;
  previewUrl: string;
  prompt: string;
}

export type TemplateCategory =
  | "Business"
  | "Marketing"
  | "Technology"
  | "Finance"
  | "Education"
  | "Fitness"
  | "Personal Brand"
  | "Real Estate"
  | "Food"
  | "Fashion"
  | "AI"
  | "Startup";

export interface BrandKit {
  id: string;
  userId: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  font: string;
  style: "Minimal" | "Premium" | "Modern" | "Bold" | "Playful";
  logoUrl: string | null;
  toneOfVoice: string | null;
}

export interface CreditBalance {
  used: number;
  total: number;
  planId: PlanId;
  renewsAt: string | null;
}

export type PlanId = "free" | "pro" | "business";

export interface Plan {
  id: PlanId;
  name: string;
  credits: number;
  priceMonthly: number;
  description: string;
  features: string[];
  highlighted?: boolean;
}
