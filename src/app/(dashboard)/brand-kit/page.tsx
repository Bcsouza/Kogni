import { BrandKitEditor } from "@/components/brand-kit/brand-kit-editor";

export default function BrandKitPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Brand Kit</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Configure your brand once — Kogni will use it to keep every generation consistent.
      </p>
      <BrandKitEditor />
    </div>
  );
}
