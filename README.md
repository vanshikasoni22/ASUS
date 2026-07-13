# ASUS Retail Demo Ecosystem — Wireframe Prototype

A clickable, **low-fidelity wireframe** for scope validation. Structure-first: grey
placeholder blocks, minimal typography, no branding. The point is to confirm
**information architecture, screen hierarchy, and navigation** before development —
not visual design.

Two connected products:

| Product | Frame | Screens |
|---|---|---|
| **Retail Demo App** | Tablet | Splash → SKU → Home → KSP → Specs → Media → Idle loop (7) |
| **CMS Admin Portal** | Desktop | Login → Dashboard → Upload → Assign → Schedule → Reports (6) |

## How to open

Just **double-click `index.html`**. It runs in any browser — no install, no build step,
no server needed. Pick a product from the landing page to step through its flow.

- **Back / Next** buttons behave like the real app.
- The **Flow ▾** button (top-right of each prototype) opens a screen map — jump to any screen.
- Interactions that work: SKU auto-detection, KSP carousel arrows, media gallery
  prev/next + thumbnails, idle attract loop (tap to wake), CMS multi-select filter
  chips, enable/disable toggle, role picker.

## File structure

```
asus-retail-demo-wireframe/
├── index.html        Landing — choose a product flow
├── retail.html       Retail Demo App  (tablet frame, RT-01…RT-07)
├── cms.html          CMS Admin Portal (desktop frame, CMS-01…CMS-06)
├── css/
│   └── wireframe.css Shared low-fi wireframe kit (reused components)
├── js/
│   └── proto.js      Shared screen-switching + Back history + flow overlay
└── README.md
```

**Frame naming** follows `RT-0x` (Retail) and `CMS-0x` (CMS), shown as a badge on every
screen and in the top bar — matches how frames would be named in Figma.

**Component reuse:** all screens share one stylesheet and one navigation engine
(`.ph` placeholder, `.btn`, `.panel`, `.stat`, `.chip`, `.spec-table`, device frames,
flow overlay). Change a component once, it updates everywhere.

## Deploy to GitHub Pages (optional)

Because it's plain static files with **relative paths**, it works on a Pages project
subpath with no config:

```bash
git init
git add .
git commit -m "ASUS retail demo wireframe prototype"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Source: `main` / root**. Your prototype will be at
`https://<you>.github.io/<repo>/`.

## Reviewer notes

- Grey blocks are deliberate placeholders for imagery, video, copy, and branding.
- This validates the **workflow**. Visual design, colours, icons, and real content come
  after the flow is approved.
