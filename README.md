# Summed Medtech — Website

Redesign of www.summed-medtech.com. Static HTML/CSS/vanilla JS, no build step.

**Staging (GitHub Pages):** https://alexchong8.github.io/summed-website/

## Structure

- `index.html` — home
- `products/` — platform overview + 6 platform pages (Simject, eSimject, Multtipen, Syrpen, eSyrpen, Dual Chamber)
- `capabilities/` `about/` `news/` `contact/` — company pages
- `404.html`
- `assets/` — css/js/img
- `tools/check_site.py` — page gate (overflow/overlap/images/viewport ladder/content policy)
- `tools/gate-all.sh` — run gate over every page

## Development

Open any page in a browser, or serve locally:

```bash
python3 -m http.server
```

Gate before committing:

```bash
bash tools/gate-all.sh
```

## Content policy

- Spec disclosure: cleared headline numbers only (Multtipen ~8 N / <10 s @ 0.75 mL; Simject EAI <0.5 s). Everything else = "tailored to your URS".
- Multtiject and unannounced programs must not appear — enforced by the checker's forbidden-term gate.
- Dual Chamber: 3-step workflow story only, no chamber internals, no dates.

## Deployment

Push to `main` → GitHub Pages builds automatically.

Production cutover to www.summed-medtech.com (DNS from wanwang) is a separate step, pending approval.
