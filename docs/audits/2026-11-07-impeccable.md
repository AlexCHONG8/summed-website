# Impeccable audit — 2026-11-07

**Tool:** Impeccable 4.8.0 (`npx impeccable@4.8.0 detect`)
**Scope:** all 36 HTML pages (EN / 中文 / RU), `assets/css/site.css`, `assets/js/site.js`.
**Commands:** `bash tools/design-check.sh` (files), plus URL scans at 1440×900 and 390×844.

## Before

| Severity | Rule | Count | What it found |
|---|---|---|---|
| warning | `kicker-above-heading` | 86 | tracked-caps label above almost every heading |
| warning | `undersized-ui-text` | 180 | 10px nav group labels / “In development” pills |
| warning | `cramped-padding` | 80 | CSS-only heuristic hits on media cards / spec band |
| warning | `low-contrast` | 39 | generic hover state 1.1:1 on navy; 404 code 3.2:1 |
| warning | `hero-eyebrow-chip` | 18 | hero eyebrow + product-type labels above h1 |
| warning | `border-accent-on-rounded` | 4 | 3px top accent on the location card |
| warning | `skipped-heading` | 3 | platforms page h1 → h3 (no h2) |
| warning | `oversized-h1` | 1 | 86px full-sentence home headline |
| advisory | `codex-grid-background` | 38 | decorative two-axis grid on every hero |
| advisory | `em-dash-overuse` | 22 | saturated em-dashes in marketing copy |

**Total:** 471 findings (411 warnings, 60 advisories).

Rendered URL scans were also run on home / platforms / Simject / contact / about / 404 / CN / RU at 1440 and 390. They confirmed the kicker, eyebrow, border-accent and skipped-heading findings and added one rendered-only `line-length` finding (~92–95 characters on section leads).

## What changed

- Removed every `section-kicker` / eyebrow label (99 labels + 3 hero eyebrows); headings now carry their own weight. Product-type information already lives in the lead paragraph.
- Moved the Dual Chamber “In development” status below the h1 (status is content, not an eyebrow).
- Raised the 10px nav group labels and “In development” pills to 11px.
- Fixed the dark-surface hover state (skip link, generic hero links) and the 404 numeral to 4.5:1+ / brand-pale.
- Removed the 3px top accent from the location card.
- Added a real h2 (“Choose a form factor” / “选择注射剂型” / “Выберите формат”) to the platforms overview, fixing h1 → h3.
- Reduced the home h1 to 64px (68px at 1920) and tightened its max width.
- Removed the decorative hero grid-line background.
- Removed the decorative 01–04 capability numbers; the four capabilities are now a hairline row.
- Narrowed section leads from 68ch to 60ch; the rendered line-length finding is gone.
- Added `.impeccable/config.json` with one reasoned exception (below).

## After

`detect .` → **21 findings, all advisory** (`em-dash-overuse`); exit code **0**. No warnings remain.

## Exceptions (reasoned)

| Rule | Scope | Reason |
|---|---|---|
| `cramped-padding` | `**/*.html` | CSS-only heuristic reads the shared spec-band hairline and media-led product cards as text hitting an edge. Rendered URL scans at 1440/390 show no cramped text; product-card text is inset 22–26px and spec cells 28px. |
| `em-dash-overuse` (advisory) | copy | House editorial voice in EN/CN/RU marketing copy; advisory only, not a blocking rule. |

The brand palette (`#002080` / `#0080C0` / `#E6F2FA` / `#FAFBFC`) is a locked brand system, not a default cream/purple palette; the detector did not flag it.

## Remaining follow-ups

- `PRODUCT.md` / `DESIGN.md` context files are not in the repo yet; `impeccable context` reports `NO_PRODUCT_MD`. The fixed site is the incumbent visual system; initialize the context layer with `/impeccable init` + `/impeccable document` when the owner wants it.
- Impeccable's project hook reports enabled; this harness does not deliver a post-edit hook automatically, so `bash tools/design-check.sh` remains the explicit gate. Enable the hook in Claude Code/Codex if those are the main editing surfaces.
