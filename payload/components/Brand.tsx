/* eslint-disable @next/next/no-img-element -- Payload's admin renders its own
   shell; next/image adds nothing on a logo this small. */

/** The CMS login screen logo. */
export function Logo() {
  return <img src="/main-logo-light.png" alt="FindMyRobo" style={{ height: 40, width: "auto" }} />;
}

/** The small mark in the CMS sidebar. */
export function Icon() {
  return <img src="/icon.png" alt="FindMyRobo" style={{ height: 28, width: 28 }} />;
}
