/* eslint-disable @next/next/no-img-element -- Payload's admin renders its own
   shell; next/image adds nothing on a logo this small. */

/** The CMS login screen logo (1200×320). */
export function Logo() {
  return (
    <img
      src="/main-logo-light.png"
      alt="FindMyRobo"
      style={{ display: "block", width: 200, maxWidth: "100%", height: "auto" }}
    />
  );
}

/**
 * The small mark in the CMS header (square, 512×512). Payload sizes the slot
 * it sits in, so the image fills that box and keeps its proportions — forcing
 * a fixed height squashed it into an oval when the slot was narrower.
 */
export function Icon() {
  return (
    <img
      src="/icon.png"
      alt="FindMyRobo"
      style={{ display: "block", width: "100%", height: "100%", aspectRatio: "1 / 1", objectFit: "contain" }}
    />
  );
}
