"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

async function downloadImage(url: string, filename: string, format: "png" | "jpeg") {
  try {
    let blob: Blob;

    if (format === "jpeg") {
      // Re-encode via canvas so .jpg downloads are genuine JPEGs, not renamed PNGs.
      const img = await loadImage(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unsupported");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encoding failed"))), "image/jpeg", 0.95),
      );
    } else {
      const response = await fetch(url);
      blob = await response.blob();
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    toast.error("Download failed", { description: "Please try again." });
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function ExportMenu({ imageUrl, filename = "kogni-creation" }: { imageUrl: string | null; filename?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" disabled={!imageUrl} className="gap-1.5" />}>
        <Download className="size-3.5" />
        Download
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => imageUrl && downloadImage(imageUrl, `${filename}.png`, "png")}>
          Download PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => imageUrl && downloadImage(imageUrl, `${filename}.jpg`, "jpeg")}>
          Download JPG
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
