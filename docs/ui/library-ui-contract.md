# Library UI Contract

## Overview

This document defines the strict pixel specifications for the Library page components. All dimensions, typography, and motion values are enforced through the `uiTokens.ts` file.

---

## Layout Dimensions

| Property | Value | Notes |
|----------|-------|-------|
| Max Content Width | 1200px | Main content area |
| Sidebar Width | 260px | Desktop only |
| Page Padding (Desktop) | 32px | >= 1024px |
| Page Padding (Tablet) | 24px | >= 768px |
| Page Padding (Mobile) | 16px | < 768px |

---

## Grid System

| Breakpoint | Columns | Viewport |
|------------|---------|----------|
| Desktop | 3 | >= 1280px |
| Tablet | 2 | 900-1279px |
| Mobile | 1 | < 900px |

**Gap:** 20px

**Tailwind Classes:**
```
grid gap-[20px] grid-cols-1 min-[900px]:grid-cols-2 min-[1280px]:grid-cols-3
```

---

## Card (PromptCard)

| Property | Value |
|----------|-------|
| Height | 156px (min=max=156px) |
| Padding | 16px |
| Border Radius | 16px |
| Border | 1px solid rgba(255,255,255,0.08) |
| Border (Hover) | 1px solid rgba(255,255,255,0.14) |

### Card Content

| Element | Spec |
|---------|------|
| Title | 16px, font-weight 600, line-clamp-1 |
| Description | 13px, opacity 0.72, line-clamp-2 |
| Max Tags on Hover | 2 |

---

## Trust Badge

| Property | Value |
|----------|-------|
| Height | 20px |
| Padding X | 8px |
| Border Radius | 9999px (pill) |
| Font Size | 12px |
| Font Weight | 500 |

### Tooltip

| Property | Value |
|----------|-------|
| Width | 240px |
| Delay | 250ms |
| Max Lines | 3 |

---

## Controls

### Search Bar

| Property | Value |
|----------|-------|
| Height | 40px |
| Border Radius | 12px |
| Padding | 12px |

### Tabs

| Property | Value |
|----------|-------|
| Height | 32px |
| Padding X | 12px |
| Border Radius | 9999px (pill) |
| Font Size | 13px |

### Filter Button

| Property | Value |
|----------|-------|
| Height | 32px |
| Border Radius | 10px |
| Font Size | 13px |

---

## Filter Drawer

| Property | Value |
|----------|-------|
| Width | 360px |
| Padding | 16px |
| Overlay Opacity | 50% |
| Footer Height | 56px |

---

## Typography

| Element | Size | Weight |
|---------|------|--------|
| Page Title | 28px | 700 |
| Card Title | 16px | 600 |
| Card Description | 13px | 400 |
| Tabs/Filters | 13px | 500 |
| Badge | 12px | 500 |

---

## Motion

### Hover Animation

| Property | Value |
|----------|-------|
| Duration | 150ms |
| Easing | ease-out |
| Translate Y | -2px |
| Shadow | 0 6px 20px rgba(0,0,0,0.25) |

### Locked State

| Property | Value |
|----------|-------|
| Overlay Opacity | 48% |
| Blur | 4px (max) |

---

## Colors

| Name | Value |
|------|-------|
| Border Default | rgba(255,255,255,0.08) |
| Border Hover | rgba(255,255,255,0.14) |
| Surface | #181818 |
| Surface Hover | #1c1c1c |
| Accent | #1DB954 |
| Accent Hover | #1ed760 |

---

## Test IDs

| Component | Test ID |
|-----------|---------|
| Library Grid | `library-grid` |
| Prompt Card | `prompt-card` |
| Trust Badge | `trust-badge` |
| Filter Drawer | `filter-drawer` |
| Library Tabs | `library-tabs` |

---

## Mobile Overrides

- No hover metadata reveal
- Hide favorite button by default
- Full-width primary action
- Card height remains 156px

---

## Source of Truth

All values are defined in `components/library/uiTokens.ts`. Import from there, never use magic numbers.
