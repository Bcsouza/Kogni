import Link from "next/link";
import { KogniLogo } from "@/components/shared/kogni-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <KogniLogo className="size-7" />
        <span className="text-lg font-semibold tracking-tight">Kogni</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
