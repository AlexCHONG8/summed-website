# Summed Medtech Website Redesign — Design Document

**Date**: 2026-10-22
**Owner**: Alex 张福昌 (BD Director, Summed Medtech 森迈医疗科技)
**Status**: Draft — awaiting approval
**Replaces**: www.summed-medtech.com (current site = near-empty Alibaba wanwang template, ~24 fragmented sitemap pages with `/name` + `/name1` duplicates)

---

## 1. Intent & Why

The current site fails at its one job: convincing a pharma BD or procurement lead that Summed is a credible OEM drug-device combination partner. It is a one-paragraph template with no product narrative, no capability proof, and no lead capture.

The business model to signal is the Ypsomed / SHL model: **a contract development + manufacturing organization for injection devices, selling to pharma companies and compounding pharmacies who need pens and auto-injectors for their molecules.**

Why now: eSyrpen Dual Chamber is reaching the point where it needs a public-facing flagship story, and BD activity (Innogen, Promomed, NAD⁺ channel, Vietnam DHF) would all benefit from a site that closes instead of undermines the pitch.

## 2. Goals

1. Look like a peer of ypsomed.com and shl-medical.com — same information logic, same visual class, but unmistakably Summed (locked brand tokens).
2. Present the product platforms clearly enough that a pharma engineer can self-qualify: what it is, what doses/formats, what standard it is built to.
3. Present eSyrpen Dual Chamber as the innovation flagship — the "why partner with Summed now" story.
4. Convert: contact form + direct BD email (alex.chong@summed-medtech.com) on every page, LinkedIn-grade news section for credibility.
5. Deploy to GitHub Pages staging first, review by URL, then cut over.

## 3. Non-Goals

- No CMS, no backend, no database. Static HTML/CSS/JS only.
- No e-commerce, no customer portal, no login.
- No Chinese/English language toggle in v1 (English only — global OEM audience; 中文 version is a follow-up if wanted).
- No blog CMS — news articles are static pages, curated, not all 17 legacy articles.

## 4. Anti-Goals (failure even if technically works)

- **Multtiject must NOT appear on the public site.** Own patent application is 在审 (pending); disclosure weakens novelty and pre-empts the Innogen BD position. No limited-reuse auto-injector story, no 1:16 reuse economics, nothing.
- No customer company names in body copy (NDA-safe rule: geography + regulatory scope only, e.g. "中国 · NMPA", "Vietnam", "Taiwan · TFDA").
- No forbidden claims: 已注册/已批准/已上市 → use 已建立对接路径/等待审计/已提交上市申请 equivalents in EN: "established engagement pathway", "audit pending", "submission filed".
- No purple gradients, no emoji icons, no Inter as display font, no random hex values outside the token system.

## 5. Constraints

### 5.1 Brand tokens (LOCKED — do not modify)

```css
:root {
  --brand-dark:  #002080;
  --brand-mid:   #003080;
  --brand-light: #0080C0;
  --brand-pale:  #E6F2FA;
  --cream:       #FAFBFC;
  --charcoal:    #0F172A;
  --ink-soft:    #475569;
  --rule:        #DCE3EC;
}
```

Typography: 中文 display `"Source Han Serif SC", "Noto Serif SC", serif`; EN display `"Source Serif Pro", Georgia, serif`; body system sans (`-apple-system, PingFang SC, ...`). Serif display + sans body everywhere.

Logo: `06_BD-Commercial/Vem-Audit/Summed logo.png` (1664×128 RGBA, best quality source) — copy into repo `assets/`.

### 5.2 Product terminology (hard rule from project memory)

| Product | Class | Correct wording |
|---|---|---|
| Simject (+ SimjectEpi) | disposable auto-injector | single-patient-use auto-injector |
| Multtipen | disposable pen injector | single-patient-use pen injector |
| Syrpen | disposable syringe pen | single-patient-use pen injector |
| eSyrpen | reusable pen injector | reusable pen injector |
| eSimject | reusable auto-injector | reusable auto-injector |
| eSyrpen Dual Chamber | development-stage platform | dual-chamber pen platform (in development) |

"Reusable" is reserved for eSyrpen/eSimject. Never "multi-dose", never "cartridge" for own systems.

### 5.3 Delivery gate

Every HTML file passes a site-adapted gate before being shown to Alex. The stock `08_Multtiject/design/check-html.py` is built for 1920×1080 decks and structurally cannot pass a scrolling page (no `.slide`/`.deck` elements, viewport-bounded overflow). **Builder call:** fork it once into `09_Website/tools/check-site.py`, keeping the same six checks under scrolling-document semantics — horizontal overflow (document may scroll vertically), text overlap, truncation, image load + aspect deformation, empty page, responsive ladder including 768px. "check-site ALL PASS" is the definition of done; the deck checker remains untouched.

### 5.4 Spec disclosure policy (Alex, 2026-10-22)

Full spec tables are never published — specs are tailor-made to each pharma's URS. Only Alex-cleared headline numbers appear (Multtipen ~8 N / <10 s @ 0.75 mL; Simject <0.5 s). DHF contents are controlled customer-program documents and are never a spec source for the public site. Unknown spec = omit, never fabricate.

### 5.5 Assets

No AI-generated device imagery in v1. Product visuals: existing real photos/render assets from product folders (Simject palette lock renders, Multtipen White-Render.png is the Multtipen hero per project memory), logo PNG. If a platform has no usable public-safe image, use a typographic/spec-sheet treatment rather than a fake render — flagged per page in the build plan.

## 6. Site Architecture

Ypsomed skeleton, SHL skin. **11 pages**:

```
/                       Home
/products/              Platform overview (chooser)
/products/simject/      Auto-injector platform (incl. Epi variant)
/products/multtipen/    Pen injector platform
/products/syrpen/       Syringe pen platform
/products/esyrpen/      Reusable pen platform
/products/esimject/     Reusable auto-injector platform
/products/dual-chamber/ eSyrpen Dual Chamber — INNOVATION FLAGSHIP
/capabilities/          Development · Manufacturing · Quality/Regulatory · Track record
/news/                  News index (curated 6-8 of 17 legacy articles + new)
/news/<slug>/           Article pages
/about/                 Company, Shanghai base, team snapshot
/contact/               Contact + form (mailto fallback)
```

### 6.1 Navigation model (from Ypsomed)

Top nav: **Products ▾ · Capabilities · News · About · Contact** + persistent "Start a conversation" CTA button (brand-light bg, navy text). Thin brand strip (3px gradient `--brand-light → --brand-mid → --brand-dark`) at very top — carried over from the deck brand spec, ties site to deck family.

Products dropdown groups platforms the way Ypsomed groups (Auto-injectors / Pen injectors / Reusable / Innovation) with a highlighted "Dual Chamber — new" entry.

Footer: address (上海市长宁区思创大厦), BD email, product links, NDA-safe line ("Devices in commercial partnership across NMPA and export markets").

### 6.2 Page patterns

**Home** (SHL drama + Ypsomed proof):
1. Full-bleed hero: device close-up or engineering photo, oversized serif headline ("Injection devices, engineered for your molecule." — final copy in build), sub-line naming the OEM offer, dual CTA (Explore platforms / Talk to BD).
2. Platform strip: 5 cards (Simject, Multtipen, Syrpen, eSyrpen family, Dual Chamber badge "In development").
3. Why Summed: 3 data callouts (years in market, units shipped, regulatory footprints — numbers from Alex, placeholders if not supplied).
4. Capabilities teaser (Ypso-style service grid).
5. News teaser (3 latest).
6. Contact band.

**Platform pages** (Ypsomed logic):
- Hero: product name, one-line positioning, image.
- Key features grid (4-6 cards).
- **Headline specs only** — full spec tables are deliberately NOT published: most specs are tailor-made to each pharma's URS, and that tailoring is itself the selling point. Only the numbers Alex has cleared go on the page (§5.4). Never pull specs from program DHFs.
- "Tailored to your URS" band — positions customization as the offer; CTA to request full specifications.
- "Built for" section: target molecule/patient contexts (generic, NDA-safe).
- Related platforms + Contact CTA.

Cleared headline specs per platform (Alex, 2026-10-22):
- **Multtipen**: USP = first-in-Asia pen matching the Novo Nordisk FlexTouch injection experience (press = inject, release = stop semantics). Disclosed: injection force ~8 N; full dose <10 s @ 0.75 mL. Hero asset = White-Render.png.
- **Simject**: EAI platform; disclosed: injection speed <0.5 s (customer-URS-derived figure — present as "sub-half-second injection, engineered to customer URS").
- Other platforms: no cleared numbers yet — typographic feature treatment, no fabricated specs.

**Dual Chamber flagship page**: SHL-Elexy-style storytelling. The public-safe story is **workflow, not internals**: traditional two-vial preparation = ~10 steps, with mix-error and wrong-patient failure modes; Dual Chamber = **3 steps — mix, purge, inject**. Mechanism section = this side-by-side step comparison; no chamber internals, no timing, no mixing specifics. Arc: problem (stability + preparation error risk of dual-molecule therapies) → 3-step vs 10-step comparison → status (in development) → partner CTA. This is the one page allowed to be cinematic (full-bleed sections, scroll narrative), because it sells the future.

**Capabilities**: four sections — Device development, Manufacturing, Quality & regulatory, Track record (anonymized: "Disposable auto-injector programs across 中国 · NMPA / Vietnam / Taiwan · TFDA markets", unit volumes as ranges).

**News**: static index + article pages. Port 6-8 strongest legacy articles (2022-2026); rest dropped, not migrated. Source = live site (scrape before cutover); legacy articles are Chinese → v1 is English-only, so porting = translation + NDA-safe wording review against §4 table + Alex sign-off on each translated article. The article list goes to Alex before any porting starts.

## 7. Visual Direction

- SHL: big hero moments, device-forward photography, generous whitespace, dark-on-light with one dark band per page for rhythm.
- Ypsomed: information discipline — every platform page answers engineer questions in the same order; spec tables with navy header + white text; credibility over decoration.
- Summed identity: navy hero bands use `--brand-dark` with white serif display; light sections `--cream`; accents strictly `--brand-light`/`--brand-pale`. Comparison/spec tables: header `--brand-dark` bg + white text, row hover `--brand-pale`. Cards: white bg, 1px `--rule` border, 8px radius. Highlight cards: `--brand-pale` bg + 4px left accent `--brand-light`.
- Responsive: desktop-first (pharma BD audience on laptops), but must not break at 768px; check-html gate multi-viewport covers this.

## 8. Technical Decisions (my calls, overridable)

| Decision | Choice | Why |
|---|---|---|
| Stack | Static HTML + CSS + minimal vanilla JS (nav, dropdown, form mailto) | No server, free hosting, matches team's HTML deliverable practice; site is 11 pages |
| Hosting | GitHub Pages, Alex's own account (`alexchong8`), public repo → staging URL | Alex's explicit ask: GitHub first, review, then deploy; site content designed public-safe (Multtiject excluded, no customer names), so public repo carries no NDA risk |
| Structure | One directory per page (`/products/simject/index.html`) | Clean URLs, mirrors sitemap |
| Shared chrome | `assets/css/site.css` + `assets/js/site.js` + partials duplicated per page (no build step) | 11 pages × small header/footer duplication is acceptable; no templating toolchain to maintain |
| Form | `mailto:` composition + visible email address (no backend) | GitHub Pages has no form backend; honest fallback |
| Images | Copied into `assets/img/`, lazy-loaded, explicit width/height attrs | Gate checks image load + deformation |
| Repo location | `/Users/alexm5/Documents/Summed/09_Website/` | Follows Summed numbering convention |

## 9. Review & Deployment Flow

1. Build → check-html gate ALL PASS per page → commit.
2. Push to GitHub repo (private) → enable Pages → staging URL.
3. Alex reviews on real URL (desktop + phone).
4. Revision round(s).
5. Cutover decision (DNS to Pages, or export for wanwang hosting) — separate approval, not part of this build.

## 10. Open Items for Alex

1. **Numbers for the home "Why Summed" callouts** — years in market / units shipped / # regulatory footprints. Ranges acceptable. (If not supplied: omit the data-callout band, use qualitative credibility strip instead — no invented numbers.)
2. **Hero imagery** — confirm which real device photos are public-safe (Simject palette renders? Multtipen White-Render.png? factory photos?). Default if none confirmed: typographic hero with logo + navy band, no fake renders.
3. **Which legacy news articles matter** — list will be shown before porting; each ported article gets translation + NDA-safe review + sign-off.

## 10a. Resolved (Alex, 2026-10-22)

- **Spec policy**: no full spec tables. Headline cleared numbers only: Multtipen ~8 N force / <10 s @ 0.75 mL / first-in-Asia FlexTouch-class USP; Simject <0.5 s injection. Everything else = "tailored to your URS" + request-specs CTA.
- **Dual Chamber story**: public-safe angle = 3-step (mix, purge, inject) vs traditional 2-vial ~10-step workflow, targeting mix-error and wrong-patient failure modes. No chamber internals.
- **GitHub**: own account `alexchong8`, public repo, Pages staging.

## 11. Builder Notes

- Do not invent product specs. Only the cleared headline numbers in §6.2 may appear; everything else = "tailored to your URS" + request-specs CTA. Never fabricate dose values, spring forces, or compatibilities; never source specs from DHFs.
- NDA-safe wording table is a hard gate on every page: no customer names, no 已上市-class claims, no Multtiject.
- Delivery gate = `09_Website/tools/check-site.py` (forked from the Multtiject deck checker, adapted to scrolling pages — same six checks; see §5.3). Deck checker stays untouched.
- Builder-decided details (my calls, overridable): 404 page, Products dropdown grouping (Auto-injectors / Pen injectors / Reusable / Innovation), self-hosted OFL webfonts, footer ICP-备案 placeholder slot, contact form fields, SEO meta per page.
