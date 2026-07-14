# ASUS Retail Demo Ecosystem — Interactive Prototype

A fully clickable, **high-fidelity client-review prototype** for the ASUS Retail Demo Ecosystem. Built as a single-page interactive workbench suitable for stakeholder walkthroughs and development handoff.

## What's inside

| # | Page | Description |
|---|---|---|
| 01 | **Cover Page** | Project overview, flow entry points |
| 02 | **Design System** | Color palette, typography, spacing rules |
| 03 | **Retail Demo App** | Simulated landscape Chromebook/tablet experience |
| 04 | **CMS Admin Portal** | Desktop browser-framed admin console |
| 05 | **Prototype Flow** | Interactive SVG diagram linking both products |
| 06 | **Components Sandbox** | Live rendering of reusable UI components |
| 07 | **Assets Catalog** | Inventory of all media assets used |

---

## Products

### Product 1 — Retail Demo App
Runs on in-store ASUS Chromebooks and tablets. Customer-facing display experience.

| Screen | ID | Description |
|---|---|---|
| Splash | RT-01 | ASUS logo + spinner → auto-advance in 3 seconds |
| SKU Detection | RT-02 | Simulated hardware scan, 4-step log sequence, auto-detects CX3402 |
| Home | RT-03 | Product hero image, description, 3-CTA navigation |
| Key Selling Points | RT-04 | 6-card carousel with icons, prev/next, animated dots |
| Tech Specs | RT-05 | 2×2 grid with real ASUS Chromebook Plus CX3402 specifications |
| Media Gallery | RT-06 | Image viewer + simulated video player with play/pause/seek |
| Idle Attract Mode | RT-07 | Full-bleed screensaver, 3-slide crossfade, tap-to-wake |

**Idle timeout:** 15 seconds of inactivity automatically triggers attract mode.

---

### Product 2 — CMS Admin Portal
Web dashboard for ASUS administrators to manage devices and content remotely.

| Screen | ID | Description |
|---|---|---|
| Login | CMS-01 | Credentials + role picker (Super Admin / Regional Admin) |
| Dashboard | CMS-02 | 4 metric cards, interactive map, recent uploads + sync logs |
| Upload Content | CMS-03 | Drag-drop zones, metadata form, live asset inventory table |
| Assign Content | CMS-04 | Multi-select filters (SKU, Region, Store) + device count estimator |
| Scheduling | CMS-05 | Date range, recurrence settings, active schedules table |
| Reports | CMS-06 | 8-column device audit table + CSV / Excel / PDF export |

**Connected state:** Uploading an asset in CMS-03 immediately appears in dashboard tables, assignment dropdowns, and scheduling screens.

---

## How to open

**Double-click `index.html`** — runs in any modern browser. No build step, no install, no server needed.

```
Assets auto-load from relative paths → works locally and on GitHub Pages.
```

---

## File structure

```
ASUS/
├── index.html              Master workbench (all 7 pages, both products)
├── css/
│   └── style.css           Material Design 3 design system + all component styles
├── js/
│   └── app.js              State engine, screen router, CMS logic, export utilities
├── assets/
│   ├── asus_chromebook_hero.png     Studio hero shot (RT-03, RT-06, CMS catalog)
│   └── asus_attract_loop.png        Retail signage banner (RT-07 attract loop)
└── README.md
```

---

## Design System

| Token | Value |
|---|---|
| Primary (ASUS Blue) | `#00539B` |
| Primary Hover | `#003E7E` |
| Primary Light | `#E6EEF7` |
| Surface Variant | `#F8F9FA` |
| Border | `#DADCE0` |
| Font (Headings) | Outfit 600–700 |
| Font (Body) | Inter 400–600 |
| Border Radius | 8px (cards), 16px (panels) |
| Spacing Grid | 8px base unit |

---

## Deploy to GitHub Pages

```bash
git push -u origin main
# Settings → Pages → Source: main / root
# Live at: https://<you>.github.io/<repo>/
```
