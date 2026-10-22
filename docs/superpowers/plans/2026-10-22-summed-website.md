# Summed Medtech Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild www.summed-medtech.com as an 11-page static site (Ypsomed IA + SHL visual + Summed locked branding), gated by a site-adapted checker, staged on GitHub Pages under `alexchong8`.

**Architecture:** Static HTML/CSS/vanilla JS, one directory per page, shared `assets/css/site.css` + `assets/js/site.js`, header/footer duplicated per page (no build step). Delivery gate = `tools/check-site.py` (fork of the Multtiject deck checker, scrolling-document semantics + content-policy check).

**Tech Stack:** HTML5, CSS (custom properties), vanilla JS, Python 3 (checker: playwright.async_api + unittest stdlib), GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-22-summed-website-redesign-design.md` — executor reads both.

## Global Constraints

- Color tokens LOCKED verbatim: `--brand-dark:#002080; --brand-mid:#003080; --brand-light:#0080C0; --brand-pale:#E6F2FA; --cream:#FAFBFC; --charcoal:#0F172A; --ink-soft:#475569; --rule:#DCE3EC`. No other hex values.
- Display font: `"Source Serif Pro", Georgia, serif` (EN pages). Body: system sans stack `-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`. No Inter as display, no emoji icons, no purple gradients.
- **All internal hrefs/src RELATIVE** (e.g. `../../assets/css/site.css`, `../index.html`). Never leading `/` — Pages serves under `alexchong8.github.io/<repo>/`.
- English only. No language toggle.
- Content policy (checker-enforced, forbidden in rendered text): `multtiject`, `multi-dose`, `多剂量`, `cartridge`, `卡式瓶`, `已注册`, `已批准`, `已上市`. Multtiject must not appear anywhere in the repo's HTML.
- Spec whitelist — the ONLY device numbers allowed: Multtipen `~8 N` injection force, `<10 s` full dose `@ 0.75 mL`; SimjectEpi (EAI epinephrine application) `<0.5 s` injection. All other spec content = "Tailored to your URS" + request-specs CTA. Never source numbers from DHFs.
- Dual Chamber story = 3 steps (Mix, Purge, Inject) vs traditional two-vial ~10 steps (mix-error, wrong-patient risk). No chamber internals, no timing, no mechanism detail.
- Multtipen USP wording: "the first pen injector of its class developed in Asia, engineered to a FlexTouch-class injection experience — press to inject, release to stop."
- Terminology: single-patient-use (Simject, Multtipen, Syrpen); reusable (eSyrpen, eSimject).
- Customer references = geography + regulator only ("中国 · NMPA", "Vietnam", "Taiwan · TFDA").
- Every page passes `python3 tools/check-site.py <file>` (exit 0) before commit.
- BD email everywhere: `alex.chong@summed-medtech.com`. Address: 上海市長寧區思创大厦 → EN: "Sichuang Tower, Changning District, Shanghai".
- Repo: `09_Website` → pushed to github.com/alexchong8/summed-website (public).

## Review Focus

1. **Horizontal overflow at narrow viewport** (768px) breaks mobile — check-site viewport ladder pins it (Task 1, fixture `bad_overflow.html`).
2. **Forbidden-content leak** (Multtiject / NDA claims / spec drift) reaches a public page — checker content gate pins it (Task 1, fixture `bad_content.html`; Task 13 full-repo sweep).
3. **Relative-path breakage at depth 2–3** (`products/multtipen/index.html` → `../../assets/...`) — checker image-load check pins it (Task 1, fixture `bad_img.html`).
4. **Dropdown nav unusable on touch** — no hover on mobile; burger menu must cover Products. Browser-verified (Task 3 Home step + Task 13 sweep).
5. **mailto form breaks with empty required fields / overlong message** (URL >2000 chars) — site.js validates + truncates (Task 10).

---

### Task 1: Site checker `tools/check-site.py`

**Files:**
- Create: `tools/check-site.py`
- Create: `tools/fixtures/good.html`, `tools/fixtures/bad_overflow.html`, `tools/fixtures/bad_content.html`, `tools/fixtures/bad_img.html`
- Test: `tools/test_check_site.py`

**Interfaces:**
- Produces: CLI `python3 tools/check-site.py <file.html>` — prints per-check PASS/FAIL lines, `== RESULT: ALL PASS ==` + exit 0 on pass, exit 1 on any fail. Checks (in order): H-OVERFLOW / OVERLAP / CLIPPED / IMG / EMPTY / VIEWPORTS / CONTENT-POLICY.

- [ ] **Step 1: Write failing tests** in `tools/test_check_site.py` (stdlib `unittest`, calls checker via `subprocess.run([sys.executable, 'tools/check_site.py', fixture])` with cwd=repo root):

```python
class TestChecker(unittest.TestCase):
    def run_checker(self, page):
        r = subprocess.run([sys.executable, 'tools/check_site.py', page],
                           capture_output=True, text=True, timeout=120)
        return r.returncode, r.stdout

    def test_good_page_passes(self):   # good.html → exit 0, "ALL PASS" in stdout
    def test_horizontal_overflow_fails(self):  # bad_overflow.html (fixed 900px-wide child) → exit 1, "H-OVERFLOW" in stdout
    def test_forbidden_content_fails(self):    # bad_content.html (contains "Multtiject" and "已上市") → exit 1, "CONTENT-POLICY" in stdout
    def test_broken_image_fails(self):         # bad_img.html (src="missing.png") → exit 1, "IMG" in stdout
```

- [ ] **Step 2: Run tests, verify all FAIL** — `python3 tools/test_check_site.py` → 4 errors (no check_site.py).

- [ ] **Step 3: Implement `tools/check_site.py`** — fork structure from `08_Multtiject/design/check-html.py` (same `find_chromium`, playwright launch, JS-eval pattern). Semantic changes:
  - Target = whole `document.body` (no `.slide`/`.deck`).
  - Overflow = horizontal only: `document.documentElement.scrollWidth > innerWidth + 2` at viewport, plus per-element `b.left < -2 || b.right > vw + 2`.
  - Overlap/clipped: reuse deck logic verbatim, scoped to body.
  - Images: `naturalWidth === 0` → FAIL; ratio distortion check only for in-viewport images (scroll each img into view first).
  - Empty: visible body text < 200 chars OR < 30 elements → FAIL.
  - Viewports: `[(1440,900),(1280,800),(1024,768),(768,1024)]` — each loads page, asserts horizontal overflow only.
  - Content policy (new): lowercased `document.body.innerText` matched against forbidden list (Global Constraints); report the matched term.
- [ ] **Step 4: Write the 4 fixtures** — good.html links `missing-css-is-ok` but has inline styles, real relative-free content, >200 chars text; bad_overflow/bad_content/bad_img each break exactly one check.
- [ ] **Step 5: Run tests, verify PASS** — `python3 tools/test_check_site.py` → OK (4 tests).
- [ ] **Step 6: Commit** — `git add tools/ && git commit -m "feat: add check-site.py delivery gate (scrolling-page fork + content policy)"`

### Task 2: Foundation assets

**Files:**
- Create: `assets/css/site.css`, `assets/js/site.js`, `assets/img/summed-logo.png`
- Modify: `tools/fixtures/good.html` (wire real css/js, keep passing)

**Interfaces:**
- Produces: `site.css` exposing `:root` tokens + classes used by every page: `.brand-strip` (3px gradient), `header.site-header` / `.nav-drop` / `.burger`, `main`, `.card`, `.card--highlight`, `.btn`, `.btn--primary` (brand-light bg + navy text), `.btn--ghost`, `.spec-table` (navy header), `.section`, `.section--dark` (brand-dark bg, cream text), `.container` (max-width 1200px, padding 24px), `.footer`. `site.js` exposing nav dropdown toggle (click + hover), burger menu, `submitContactForm()`.

- [ ] **Step 1: Copy logo** — `cp "/Users/alexm5/Documents/Summed/06_BD-Commercial/Vem-Audit/Summed logo.png" assets/img/summed-logo.png`; verify `file` reports PNG 1664×128.
- [ ] **Step 2: Write `site.css`** — tokens verbatim (Global Constraints); base reset; typography scale (h1 clamp(40px,6vw,72px), h2 clamp(28px,4vw,44px), body 17px/1.6); component classes above; responsive breakpoints at 1024/768 (nav → burger, grids → single column).
- [ ] **Step 3: Write `site.js`** — dropdown click-toggle + Escape-close + outside-click-close; burger toggles `.nav-open` on header; no other behavior yet.
- [ ] **Step 4: Update `good.html` fixture** to link `../assets/css/site.css` + `../assets/js/site.js`; run checker → ALL PASS.
- [ ] **Step 5: Commit** — `git add assets/ tools/fixtures/good.html && git commit -m "feat: brand foundation — tokens, site.css, site.js, logo"`

### Task 3: Home page + canonical chrome

**Files:**
- Create: `index.html`
- Create: `docs/chrome.md` (the canonical header/footer snippet, copied verbatim into every later page)

**Interfaces:**
- Produces: canonical `<header>`/`<footer>` markup in `docs/chrome.md` with nav tree: **Products ▾** [Auto-injectors: Simject · eSimject / Pen injectors: Multtipen · Syrpen / Reusable: eSyrpen / Innovation: eSyrpen Dual Chamber — *In development*] · **Capabilities** · **News** · **About** · **Contact** + `.btn--primary` "Start a conversation" → `contact/`. Footer: logo, address (Sichuang Tower, Changning District, Shanghai), BD email, product links, tagline "Injection devices, engineered for your molecule.", ICP placeholder slot `<!-- ICP -->`.

- [ ] **Step 1: Write `index.html`** — sections per spec §6.2 Home: hero (navy `--brand-dark` band, serif headline "Injection devices, engineered for your molecule.", sub-line "OEM development and manufacturing of pen injectors and auto-injectors for pharma and compounding-pharmacy partners", CTAs Explore platforms → `products/` / Talk to BD → `contact/`); platform strip = 5 cards (typographic, no device photos in v1); "Why Summed" = qualitative band (three cards: Device development · Manufacturing · Quality & regulatory — NO invented numbers); capabilities teaser; news teaser = 3 placeholder cards labelled from `news/`; contact band. No data callouts (numbers not supplied — spec §10.1 default).
- [ ] **Step 2: Browser-verify** — chrome-devtools MCP: open file, snapshot; click Products dropdown (opens), click "Start a conversation" (navigates placeholder OK — file not yet exists is fine at this stage, link correctness checked in Task 13); resize 768×1024 → burger visible, menu opens.
- [ ] **Step 3: Gate** — `python3 tools/check-site.py index.html` → ALL PASS.
- [ ] **Step 4: Extract chrome to `docs/chrome.md`** — header + footer verbatim with depth-relative-link note (`index.html` depth = `./`, `products/x/index.html` depth = `../../`).
- [ ] **Step 5: Commit** — `git add index.html docs/chrome.md && git commit -m "feat: home page + canonical chrome"`

### Task 4: Products overview + Multtipen

**Files:**
- Create: `products/index.html`, `products/multtipen/index.html`
- Copy: Multtipen hero render → `assets/img/multtipen-hero.png` (locate via `find "/Users/alexm5/Documents/Summed/01_Carol-Multtipen" -name "White-Render*"`; if absent, typographic hero fallback — flag in commit message)

**Interfaces:**
- Consumes: chrome from `docs/chrome.md` (links at `../../` depth), css/js classes from Task 2.

- [ ] **Step 1: Write `products/index.html`** — platform chooser: 5 cards (name, class, one-line positioning, → page), Dual Chamber card badged "In development".
- [ ] **Step 2: Write `products/multtipen/index.html`** — platform page pattern per spec §6.2: hero (Multtipen · Single-patient-use pen injector · first-in-Asia FlexTouch-class line from Global Constraints); features grid 4 cards (FlexTouch-class experience / tailored to URS / OEM ready / quality system); headline-spec band with ONLY `~8 N` + `<10 s @ 0.75 mL`; "Tailored to your URS" band + request-specs CTA; related platforms (Syrpen, eSyrpen); contact CTA.
- [ ] **Step 3: Browser-verify both** — snapshot + dropdown + 768 burger check.
- [ ] **Step 4: Gate both** — checker ALL PASS on each.
- [ ] **Step 5: Commit** — `git add products/ assets/img/ && git commit -m "feat: products overview + Multtipen platform page"`

### Task 5: Simject platform page

**Files:**
- Create: `products/simject/index.html`

- [ ] **Step 1: Write page** — same pattern as Task 4. Hero: Simject · Single-patient-use auto-injector. Headline spec belongs to the **EAI application**: SimjectEpi `<0.5 s` injection for epinephrine auto-injector use, framed "sub-half-second injection for epinephrine (EAI) applications, engineered to customer URS". Base Simject platform = no numbers, tailored-to-URS band. Typographic hero (no cleared render).
- [ ] **Step 2: Browser-verify + gate** — same checks.
- [ ] **Step 3: Commit** — `git commit -am "feat: Simject platform page"`

### Task 6: Syrpen, eSyrpen, eSimject pages

**Files:**
- Create: `products/syrpen/index.html`, `products/esyrpen/index.html`, `products/esimject/index.html`

- [ ] **Step 1: Write 3 pages** — same pattern, typographic heroes, NO device numbers (nothing cleared). eSyrpen page carries a Dual Chamber teaser card → `../dual-chamber/`. Terminology per Global Constraints (Syrpen single-patient-use; eSyrpen/eSimject reusable).
- [ ] **Step 2: Browser-verify + gate each**.
- [ ] **Step 3: Commit** — `git commit -am "feat: Syrpen, eSyrpen, eSimject platform pages"`

### Task 7: Dual Chamber flagship

**Files:**
- Create: `products/dual-chamber/index.html`

- [ ] **Step 1: Write page** — cinematic scroll narrative per spec §6.2: (1) full-bleed dark hero "Two molecules. One pen. Three steps."; (2) problem section — traditional two-vial preparation, ~10 steps, mix-error + wrong-patient failure modes (generic wording, no competitor names); (3) 3-step comparison — Mix / Purge / Inject as large numbered bands vs condensed 10-step list; (4) status — "In development" badge, no dates; (5) partner CTA → contact. No chamber internals/timing/mechanism (Global Constraints).
- [ ] **Step 2: Browser-verify** — full-page screenshot for scroll narrative integrity + 768 check.
- [ ] **Step 3: Gate + commit** — `git commit -am "feat: eSyrpen Dual Chamber flagship page"`

### Task 8: Capabilities

**Files:**
- Create: `capabilities/index.html`

- [ ] **Step 1: Write page** — 4 sections per spec: Device development / Manufacturing / Quality & regulatory / Track record. Track record uses geography+regulator references only ("中国 · NMPA", "Vietnam", "Taiwan · TFDA") + volume ranges as "production programs across markets" (qualitative, no invented numbers). Each section ends with CTA.
- [ ] **Step 2: Browser-verify + gate + commit** — `git commit -am "feat: capabilities page"`

### Task 9: About + Contact

**Files:**
- Create: `about/index.html`, `contact/index.html`

- [ ] **Step 1: Write About** — company story (Shanghai-based device developer + manufacturer), what we make (5 platforms), quality commitment. No team photos/names (not supplied) — "team snapshot" becomes one-line summary.
- [ ] **Step 2: Write Contact** — visible email `alex.chong@summed-medtech.com`, phone +86 186 1699 0383, address, and form (name, company, email, message): `submitContactForm()` validates required fields, truncates message to 1500 chars, composes `mailto:alex.chong@summed-medtech.com?subject=...&body=...`, opens via `window.location.href`. Include noscript note with plain email.
- [ ] **Step 3: Browser-verify form** — submit empty → validation error shown, no navigation; fill + submit → mailto composition (verify via JS-eval of generated URL, not actual send).
- [ ] **Step 4: Gate + commit** — `git commit -am "feat: about + contact pages with mailto form"`

### Task 10: News index + 404

**Files:**
- Create: `news/index.html`, `404.html`

- [ ] **Step 1: Write `news/index.html`** — intro + empty-state grid ("Newsroom coming online — latest updates from Summed." placeholder card). Article pages deferred until Alex supplies article list (spec §10.3); template task not started now.
- [ ] **Step 2: Write `404.html`** — brand-styled, links Home + Products.
- [ ] **Step 3: Gate + commit** — `git commit -am "feat: news index + 404"`

### Task 11: SEO + meta sweep

**Files:**
- Modify: all 12 HTML files (`<head>` only)

- [ ] **Step 1: Add to every page** — unique `<title>` ("Summed Medtech — <Page>"), meta description (1 sentence), `<meta property="og:...">` set, favicon link → `assets/img/summed-logo.png`, `<html lang="en">`.
- [ ] **Step 2: Gate all pages** — loop checker over every HTML file → ALL PASS each.
- [ ] **Step 3: Commit** — `git commit -am "feat: SEO meta sweep across all pages"`

### Task 12: Full-site content sweep

**Files:**
- No new files (verification task; fixes where found)

- [ ] **Step 1: Forbidden-string grep** — `grep -riE "multtiject|multi-dose|多剂量|cartridge|卡式瓶|已注册|已批准|已上市" --include="*.html" .` → zero hits (checker already covers rendered text; this catches comments/attributes).
- [ ] **Step 2: Spec-drift grep** — `grep -rnoE "[0-9]+ ?(N|mL|s\b)" --include="*.html" .` → review every hit against whitelist (8 N / 0.75 mL / 10 s / 0.5 s contexts only; the "~10 steps" narrative phrase allowed as literal "10 steps").
- [ ] **Step 3: Link check** — chrome-devtools: crawl every page, click every nav/dropdown/CTA link → no 404, no dead anchors.
- [ ] **Step 4: Commit fixes** — `git commit -am "fix: content sweep — policy/spec/link corrections"` (skip if clean).

### Task 13: GitHub Pages staging

**Files:**
- Create: `README.md` (repo intro + Pages URL)

- [ ] **Step 1: Create remote** — `gh repo create alexchong8/summed-website --public --source=. --push` (fallback if no gh auth: instruct Alex; do not block earlier tasks).
- [ ] **Step 2: Enable Pages** — `gh api repos/alexchong8/summed-website/pages -X POST -f "source[branch]=main" -f "source[path]=/"` (or Settings UI instruction).
- [ ] **Step 3: Verify live** — fetch `https://alexchong8.github.io/summed-website/` — 200 + logo renders + nav works (chrome-devtools against live URL).
- [ ] **Step 4: Commit README + report URL to Alex** — `git commit -am "docs: README with staging URL"`.

## Deferred (not this plan)

- News article porting (needs Alex's article list + translation sign-off — spec §10.3).
- Chinese-language version.
- DNS cutover from wanwang hosting (separate approval — spec §9.5).
- Home "Why Summed" data callouts (needs numbers — spec §10.1).
