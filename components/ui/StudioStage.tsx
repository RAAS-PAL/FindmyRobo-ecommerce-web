import Image from "next/image";
import type { StudioRobot } from "@/data/homeShowcase";

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
  robots,
  priority = false,
}: {
  robots: StudioRobot[];
  priority?: boolean;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0b0d10]">
      {/* backdrop: graphite, a little lighter where the light falls */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(90%_70%_at_55%_38%,#1d2230_0%,#12151c_45%,#0b0d10_100%)]"
      />
      {/* the blue key light behind the robots */}
      <div
        aria-hidden="true"
        className="absolute top-[4%] left-1/2 h-[62%] w-[80%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(var(--accent-rgb)/0.42),rgb(var(--accent-rgb)/0.12)_55%,transparent)] blur-2xl lg:left-[57%] lg:w-[46%]"
      />
      {/* floor: a seamless cove (no horizon line, as in a real studio: a
          hard line would cut through the copy and leave the rear robot
          floating above it), then a pool of light where the robots stand */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(to_bottom,transparent_0%,#141824_35%,#0b0d10_100%)] lg:h-[62%]"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[14%] left-1/2 h-[30%] w-[90%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(120_160_255/0.16),transparent)] lg:bottom-[30%] lg:left-[57%] lg:w-[50%]"
      />

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
            className="relative h-auto w-full drop-shadow-[0_18px_22px_rgba(0,0,0,0.55)]"
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
