# Summed Medtech — Website

Redesign of www.summed-medtech.com. Static HTML/CSS/vanilla JS, no build step.

**Staging (GitHub Pages):** https://alexchong8.github.io/summed-website/

## Structure

- `index.html` — home
- `products/` — platform overview + 5 platform pages (Simject, eSimject, Multtipen, eSyrpen, Dual Chamber)
- `capabilities/` `about/` `news/` `contact/` — company pages
- `404.html`
- `assets/` — css/js/img
- `tools/check_site.py` — page gate (overflow/overlap/images/viewport ladder/content policy)
- `tools/gate-all.sh` — run gate over every page
- `tools/design-check.sh` — Impeccable design detector (62 rules)
- `docs/audits/` — design audit notes

## Development

Open any page in a browser, or serve locally:

```bash
python3 -m http.server
```

Gate before committing:

```bash
bash tools/gate-all.sh
```

## Design check (Impeccable)

Run the Impeccable detector after UI edits:

```bash
bash tools/design-check.sh                 # whole site
bash tools/design-check.sh products/       # one area
bash tools/design-check.sh --json . > findings.json
```

It runs the 62-rule anti-pattern / quality detector locally (no model, no API key, no quota; requires Node 18.19+ for `npx`). Warnings should be fixed or registered with a reason in `.impeccable/config.json`; advisory findings do not fail the run. The audit trail lives in `docs/audits/`.

## Content policy

- Spec disclosure: cleared headline numbers only (Multtipen ~8 N / <10 s @ 0.75 mL; Simject EAI <0.5 s). Everything else = "tailored to your URS".
- Multtiject and unannounced programs must not appear — enforced by the checker's forbidden-term gate.
- Dual Chamber: 3-step workflow story only, no chamber internals, no dates.

## Deployment

Push to `main` → GitHub Pages builds automatically.

Production cutover to www.summed-medtech.com (DNS from wanwang) is a separate step, pending approval.
