import Image from "next/image";
import type { StudioPhoto, StudioRobot } from "@/data/homeShowcase";

/**
 * A product "studio shot" built from transparent cut-outs, instead of a photo:
 * a graphite backdrop, an electric-blue glow, a lit floor and a soft
 * reflection under each robot. Unlike pasting cut-outs into a garden photo
 * (which looks composited: the lighting, angle and focus never match), a
 * studio set is meant to look staged, and it matches the site's palette.
 *
 * Fills its (relative) parent. Robot positions are percentages of the stage,
 * with separate phone and desktop values (StudioRobot in data/homeShowcase.ts).
 */
export default function StudioStage({
  robots = [],
  photo,
  priority = false,
}: {
  robots?: StudioRobot[];
  photo?: StudioPhoto;
  /** Kept for the data: the set is plain graphite now, not lit. */
  light?: "neutral" | "accent";
  priority?: boolean;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-forest-950">
      {/* a plain graphite set: no key light, glow or light pool */}
      {photo && (
        // the box: the photo may use any of it but never leaves it
        <div
          className="absolute top-(--t) right-(--r) bottom-(--bt) left-(--l) flex items-center justify-center [container-type:size] lg:top-(--t-lg) lg:right-(--r-lg) lg:bottom-(--bt-lg) lg:left-(--l-lg)"
          style={
            {
              "--t": photo.phone.top,
              "--r": photo.phone.right,
              "--bt": photo.phone.bottom,
              "--l": photo.phone.left,
              "--t-lg": photo.desktop.top,
              "--r-lg": photo.desktop.right,
              "--bt-lg": photo.desktop.bottom,
              "--l-lg": photo.desktop.left,
            } as React.CSSProperties
          }
        >
          {/* as large as fits: full width, unless that would be too tall */}
          <div
            className="relative shrink-0"
            style={{
              width: `min(100cqw, calc(100cqh * ${photo.width / photo.height}))`,
              aspectRatio: `${photo.width} / ${photo.height}`,
            }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 60vw, 100vw"
              // a photo with its own backdrop: fade every edge of the frame
              // (the robot sits clear of the fades) so it melts into the set;
              // a transparent cut-out has no edges to hide
              className={`object-cover ${
                photo.fade === false
                  ? ""
                  : "[mask-image:linear-gradient(to_right,transparent,black_5%,black_60%,transparent_97%),linear-gradient(to_bottom,transparent,black_13%,black_70%,transparent_100%)] [mask-composite:intersect]"
              }`}
            />
          </div>
        </div>
      )}

      {robots.map((robot) => (
        <div
          key={robot.src}
          className="absolute bottom-(--b) left-(--l) w-(--w) lg:bottom-(--b-lg) lg:left-(--l-lg) lg:w-(--w-lg)"
          style={
            {
              "--l": robot.phone.left,
              "--b": robot.phone.bottom,
              "--w": robot.phone.width,
              "--l-lg": robot.desktop.left,
              "--b-lg": robot.desktop.bottom,
              "--w-lg": robot.desktop.width,
              zIndex: robot.z ?? 1,
            } as React.CSSProperties
          }
        >
          <Image
            src={robot.src}
            alt={robot.alt}
            width={robot.width}
            height={robot.height}
            priority={priority}
            sizes="(min-width: 1024px) 30vw, 60vw"
            className="relative h-auto w-full"
          />
          {/* reflection: the same cut-out, flipped and fading into the floor */}
          <Image
            src={robot.src}
            alt=""
            aria-hidden="true"
            width={robot.width}
            height={robot.height}
            sizes="(min-width: 1024px) 30vw, 60vw"
            className="pointer-events-none absolute top-full left-0 h-auto w-full -scale-y-100 opacity-20 [mask-image:linear-gradient(to_bottom,transparent_55%,black_100%)]"
          />
        </div>
      ))}
    </div>
  );
}
