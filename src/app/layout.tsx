import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Kogni — AI Creative Studio",
    template: "%s · Kogni",
  },
  description:
    "Kogni turns your ideas into stunning AI-generated visuals, social posts and carousels in seconds. The AI creative studio for Instagram posts, carousels, ads and creatives.",
  keywords: [
    "AI image generator",
    "AI Instagram post generator",
    "AI carousel generator",
    "Instagram carousel maker",
    "AI social media design",
    "AI creative generator",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Kogni — AI Creative Studio",
    description:
      "Turn your ideas into stunning AI-generated visuals, social posts and carousels in seconds.",
    url: appUrl,
    siteName: "Kogni",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kogni — AI Creative Studio",
    description:
      "Turn your ideas into stunning AI-generated visuals, social posts and carousels in seconds.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider delay={150}>
            {children}
            <Toaster position="bottom-right" />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
