"use client";

import { createContext, useContext } from "react";
import type { PreviewTarget } from "@/lib/cmsPreview";

/**
 * Lets an editor Panel ask the live preview to scroll to the storefront
 * section it edits (data-cms markers). Provided by EditorShell; a Panel
 * outside one simply has nothing to call.
 */
export const PreviewTargetContext = createContext<
  ((target: PreviewTarget, force?: boolean) => void) | null
>(null);

export function usePreviewTarget() {
  return useContext(PreviewTargetContext);
}
