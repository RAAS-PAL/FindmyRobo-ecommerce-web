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

  if (photo.cutout) {
    return (
      <div
        className={`absolute inset-0 bg-[#e4e8ee] ${className}`}
      >
        {/* Below sm the copy sits under the photo, so the machine can use
            the frame; from sm the copy is over the top of the card and the
            machine stays in the lower half. */}
        <div className="absolute inset-x-[10%] top-[8%] bottom-[7%] sm:inset-x-[9%] sm:top-[47%] sm:bottom-[6%]">
          {/* floor shadow under the feet */}
          <div
            aria-hidden="true"
            className="absolute inset-x-[8%] bottom-0 h-[10%] translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(15_20_30/0.28),transparent)]"
          />
          <Image
            src={photo.cutout.src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            className="object-contain object-bottom"
          />
        </div>
      </div>
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
        className={`object-cover [object-position:var(--focus-phone)] sm:[object-position:var(--focus)] ${className}`}
        style={
          {
            "--focus": photo.focus ?? "50% 50%",
            "--focus-phone": photo.focusPhone ?? photo.focus ?? "50% 50%",
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
      className={`absolute inset-0 bg-forest-900 ${className}`}
    >
      {brief && (
        <div
          className={`absolute inset-x-4 flex items-start gap-2.5 rounded-control border border-white/10 bg-black/50 px-3 py-2.5 text-white/80 sm:inset-x-auto sm:left-5 sm:max-w-md ${
            captionAt === "top" ? "top-4 sm:top-5" : "bottom-4 sm:bottom-5"
          }`}
        >
          <Camera className="mt-0.5 h-4 w-4 shrink-0 text-accent-300" aria-hidden="true" />
          <p className="text-caption leading-snug">
            <span className="text-caption font-semibold text-accent-300">
              {t("photoComing")}
            </span>
            <span className="mt-0.5 block">{brief}</span>
          </p>
        </div>
      )}
    </div>
  );
}
