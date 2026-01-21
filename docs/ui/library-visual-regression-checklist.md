# Meema Library v2 — Visual Regression Checklist (STRICT)

Use this checklist for every PR that touches:
- components/library/*
- library page route
- shared typography/layout tokens affecting Library

## A) Layout & Grid
- [ ] Max content width is **1200px** (no new full-bleed sections introduced).
- [ ] Desktop grid is **exactly 3 columns** at >=1280px.
- [ ] Tablet grid is **exactly 2 columns** at 900–1279px.
- [ ] Mobile grid is **1 column** under 900px.
- [ ] Grid gap remains **20px**.
- [ ] Sidebar width remains **260px** and padding **16px**.

## B) Top Bar + Controls
- [ ] Title is **28px / 700**.
- [ ] Search height **40px**, radius **12px**, padding **12px**.
- [ ] Tabs height **32px**, radius **999px**, font **13px**.
- [ ] Filter button height **32px**, radius **10px**, font **13px**.
- [ ] No new always-visible filter rows added outside drawer.

## C) PromptCard v2 (Core)
- [ ] Every card height is **exactly 156px** (no exceptions).
- [ ] Card padding **16px**, radius **16px**.
- [ ] Border is subtle: rgba(255,255,255,0.08) baseline.
- [ ] Default content shows ONLY:
  - [ ] Title (clamp-1)
  - [ ] Description (clamp-2)
  - [ ] Trust badge
  - [ ] Primary action (+ optional favorite)
- [ ] No tag clouds appear in default state.
- [ ] Provider/language are NOT persistent by default.

## D) Hover + Motion
- [ ] Hover duration ≤ **150ms**.
- [ ] Hover uses **translateY(-2px)** (no scaling).
- [ ] Hover shadow matches spec: `0 6px 20px rgba(0,0,0,0.25)`.
- [ ] Hover metadata row appears on desktop only and:
  - [ ] Has height **22px**
  - [ ] Shows provider + language + max **2 tags**
  - [ ] Does not wrap; truncates instead
- [ ] No bounce/elastic easing introduced.

## E) Locked State
- [ ] Locked overlay opacity is **48%**.
- [ ] Optional blur does not exceed **4px**.
- [ ] Lock icon is **16px**.
- [ ] Upgrade CTA is **28px height**, font **12px**, radius **8px**.
- [ ] Locked cards still show title/description/trust badge.

## F) Trust Badge
- [ ] Badge height **20px**, font **12px**, weight **500**, radius **999px**.
- [ ] Tooltip width **240px**, delay **250ms**, max 3 lines.
- [ ] No neon/saturated colors used.

## G) Filter Drawer
- [ ] Drawer width is **360px** on desktop.
- [ ] Drawer padding **16px**.
- [ ] Overlay opacity **50%**.
- [ ] Footer height **56px**.

## H) Mobile Behavior
- [ ] No hover-only metadata is required for core understanding.
- [ ] Card height remains **156px** on mobile.
- [ ] Primary action is full-width.
- [ ] Favorite is hidden by default (unless explicitly designed otherwise).
- [ ] Filter UI is usable (drawer or bottom sheet) without overflow.

## I) Snapshots / Manual Screens
Capture screenshots for review:
- [ ] Desktop 1440px wide (Library grid + hover on a card)
- [ ] Tablet 1024px wide
- [ ] Mobile 390px wide (filter open)
- [ ] Locked card state (desktop + mobile)
- [ ] Empty state (no results)

## J) Final Gate
- [ ] No magic numbers added (use `components/library/uiTokens.ts`).
- [ ] `data-testid` attributes remain present for key elements.
- [ ] Dev-only warnings still function (no noisy console spam).

If any item fails, revise before merge.
