# Project: E-commerce RAASPAL

## What This Project Is
A standalone Next.js e-commerce website for RAAS PAL to sell 
robots (mowers, pool cleaners, cleaning robots and more) in Thailand. 
Reference design: robomate.com.au (Robomate Australia).

This is a SEPARATE project from robot-recommendation-api 
and other AISolution work. Do not cross-reference unless 
explicitly told to.

## Session Start Instructions
1. Read hot.md FIRST — most recent context
2. Read history.md — full session history  
3. Read index.md — project structure map
4. Then read the rest of this file
5. Confirm understanding before writing any code

## Before Starting Any Session
1. Read history.md
2. Read index.md
3. Check vault/projects/ for open decisions

## Confirmed Decisions
- Tech stack: Next.js (frontend + backend, no Java)
- Payment: Omise (credit card now, PromptPay later)
- Fulfillment: Sokochan REST API
- Hosting: Vercel
- Currency: Thai Baht (฿)
- CMS: Payload 3, embedded in this app at /cms (decided 2026-09-24; replaced
  a short-lived hand-built editor). Own users (admin/marketing), data in the
  `payload` schema of the same Supabase Postgres. See README → CMS.

## Design Rules
- Use ui-ux-pro-max skill for color/font/layout decisions
- Use frontend-design skill for aesthetic direction
- Ground design in real reference: Robomate Australia structure
- Colors: LIGHT theme, forest green + yellow (CEO decision 2026-07-08,
  supersedes the earlier navy + gold theme). Tokens live in
  app/globals.css @theme (forest-* scale + gold).
- Hero: video slot in data/siteConfig.ts (heroVideoUrl); animated
  lawn scene is the fallback while no video is configured

## Brand Name Status
- Still deciding: Not sure yet, still finding and thinking
- TBD — update here once finalized