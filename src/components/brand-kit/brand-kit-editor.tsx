"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STYLE_OPTIONS = ["Minimal", "Premium", "Modern", "Bold", "Playful"];

interface BrandKit {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  font: string;
  style: string;
  toneOfVoice: string;
}

export function BrandKitEditor() {
  const [kit, setKit] = useState<BrandKit | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    fetch("/api/brand-kit")
      .then((res) => res.json())
      .then((data) => {
        setKit(data.brandKit);
        setIsDemo(Boolean(data.demo));
      })
      .catch(() => toast.error("Couldn't load your Brand Kit."));
  }, []);

  async function handleSave() {
    if (!kit) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/brand-kit", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kit),
      });
      if (!response.ok) throw new Error();
      toast.success("Brand Kit saved");
    } catch {
      toast.error("Couldn't save your Brand Kit.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!kit) return null;

  return (
    <div className="space-y-6">
      {isDemo && (
        <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          Demo mode — connect Supabase to save your Brand Kit.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Brand name</Label>
            <Input value={kit.name} onChange={(e) => setKit({ ...kit, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ColorField label="Primary" value={kit.primaryColor} onChange={(v) => setKit({ ...kit, primaryColor: v })} />
            <ColorField label="Secondary" value={kit.secondaryColor} onChange={(v) => setKit({ ...kit, secondaryColor: v })} />
            <ColorField label="Accent" value={kit.accentColor} onChange={(v) => setKit({ ...kit, accentColor: v })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Typography & Style</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Font</Label>
            <Input value={kit.font} onChange={(e) => setKit({ ...kit, font: e.target.value })} placeholder="Inter" />
          </div>
          <div className="space-y-1.5">
            <Label>Style</Label>
            <div className="flex flex-wrap gap-1.5">
              {STYLE_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setKit({ ...kit, style: s })}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    kit.style === s ? "border-brand bg-brand/[0.08]" : "border-border text-muted-foreground hover:bg-accent",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tone of Voice</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={kit.toneOfVoice}
            onChange={(e) => setKit({ ...kit, toneOfVoice: e.target.value })}
            placeholder="Confident, clear, and a little playful."
            rows={3}
            className="resize-none"
          />
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isSaving} className="bg-brand text-brand-foreground hover:bg-brand/90">
        {isSaving && <Loader2 className="size-4 animate-spin" />}
        Save Brand Kit
      </Button>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2 rounded-lg border border-input px-2 py-1.5">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-6 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-xs font-mono outline-none"
        />
      </div>
    </div>
  );
}
