/* Payload CMS root layout — from Payload's app template, with the admin
   moved from /admin to /cms (see payload.config.ts for why). This is its own
   root layout: the CMS does not load the storefront's fonts, Tailwind or
   providers, and the storefront does not load Payload's styles. */
import config from "@payload-config";
import "@payloadcms/next/css";
import type { ServerFunctionClient } from "payload";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import type React from "react";
import { importMap } from "./cms/importMap.js";
import "./custom.css";

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
