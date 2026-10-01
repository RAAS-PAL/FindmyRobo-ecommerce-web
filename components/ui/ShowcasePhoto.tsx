"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Camera } from "lucide-react";
import { pick } from "@/data/siteContent";
import type { ShowcasePhoto as Photo } from "@/data/homeShowcase";
import StudioStage from "@/components/ui/StudioStage";

/**
 * A showcase photo filling its (relative) parent. Until the photo exists it
 * renders a dark placeholder that says which shot is wanted, so the layout can
 * be reviewed with real proportions and the brief travels with it.
 */
export default function ShowcasePhoto({
  photo,
  alt,
  sizes,
  priority = false,
  captionAt = "bottom",
  className = "",
}: {
  photo: Photo;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** Placeholder only: keep its note clear of whatever sits over the photo. */
  captionAt?: "top" | "bottom";
  className?: string;
}) {
  const t = useTranslations("showcase");
  const locale = useLocale();

  if (photo.studioPhoto || photo.studio?.length) {
    return (
      <StudioStage
        robots={photo.studio}
        photo={photo.studioPhoto}
        light={photo.studioLight}
        priority={priority}
      />
    );
  }

  if (photo.image) {
    return (
      <Image
        src={photo.image}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover [object-position:var(--focus-phone)] sm:[object-position:var(--focus)] ${photo.photoScale ? "scale-(--photo-scale)" : ""} ${className}`}
        style={
          {
            "--focus": photo.focus ?? "50% 50%",
            "--focus-phone": photo.focusPhone ?? photo.focus ?? "50% 50%",
            "--photo-scale": photo.photoScale ?? 1,
          } as React.CSSProperties
        }
      />
    );
  }

  // the brief for the photo still to come; no note at all without one
  const brief = pick(photo.shot, locale);
  return (
    <div
      role="img"
      aria-label={alt}
      className={`absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_100%,#3a3b41_0%,#1b1c20_55%,#0a0a0b_100%)] ${className}`}
    >
      {/* floor line, so the empty frame still reads as a place a robot stands */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-[30%] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />
      {brief && (
        <div
          className={`absolute inset-x-4 flex items-start gap-2.5 rounded-lg border border-white/10 bg-black/40 px-3 py-2.5 text-white/80 backdrop-blur-sm sm:inset-x-auto sm:left-5 sm:max-w-md ${
            captionAt === "top" ? "top-4 sm:top-5" : "bottom-4 sm:bottom-5"
          }`}
        >
          <Camera className="mt-0.5 h-4 w-4 shrink-0 text-accent-300" aria-hidden="true" />
          <p className="text-[12px] leading-snug">
            <span className="font-mono text-[10.5px] font-semibold tracking-[0.2em] text-accent-300 uppercase">
              {t("photoComing")}
            </span>
            <span className="mt-0.5 block">{brief}</span>
          </p>
        </div>
      )}
    </div>
  );
}
