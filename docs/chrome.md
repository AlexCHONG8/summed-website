# Canonical Chrome (header + footer)

Every page uses this exact markup. Adjust only the relative-link depth:

- `index.html` (root): `assets/...`, `products/...`, `contact/...`
- depth-1 pages (`capabilities/`, `news/`, `about/`, `contact/`, `products/`): `../assets/...`, `../index.html`, `../products/...`
- depth-2 pages (`products/<name>/`): `../../assets/...`, `../../index.html`, `../index.html` (products overview), `../../contact/...`

Logo `<img>` keeps explicit width/height (442×34 header, 390×30 footer) to avoid layout shift.

## Header

```html
<div class="brand-strip"></div>

<header class="site-header">
  <div class="container">
    <a class="site-logo" href="{DEPTH}index.html"><img src="{DEPTH}assets/img/summed-logo.png" alt="Summed Medtech" width="442" height="34"></a>
    <nav class="main-nav" aria-label="Main">
      <ul>
        <li class="nav-item">
          <a href="{DEPTH}products/index.html">Products</a>
          <div class="nav-drop">
            <div class="drop-group">
              <div class="drop-label">Auto-injectors</div>
              <a href="{DEPTH}products/simject/index.html">Simject</a>
              <a href="{DEPTH}products/esimject/index.html">eSimject</a>
            </div>
            <div class="drop-group">
              <div class="drop-label">Pen injectors</div>
              <a href="{DEPTH}products/multtipen/index.html">Multtipen</a>
              <a href="{DEPTH}products/syrpen/index.html">Syrpen</a>
            </div>
            <div class="drop-group">
              <div class="drop-label">Reusable</div>
              <a href="{DEPTH}products/esyrpen/index.html">eSyrpen</a>
            </div>
            <div class="drop-group">
              <div class="drop-label">Innovation</div>
              <a href="{DEPTH}products/dual-chamber/index.html">eSyrpen Dual Chamber<span class="drop-new">In development</span></a>
            </div>
          </div>
        </li>
        <li><a href="{DEPTH}capabilities/index.html">Capabilities</a></li>
        <li><a href="{DEPTH}news/index.html">News</a></li>
        <li><a href="{DEPTH}about/index.html">About</a></li>
        <li><a href="{DEPTH}contact/index.html">Contact</a></li>
      </ul>
    </nav>
    <div class="header-cta">
      <a class="btn btn--primary" href="{DEPTH}contact/index.html">Start a conversation</a>
    </div>
    <button class="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</header>
```

## Footer

```html
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <img src="{DEPTH}assets/img/summed-logo.png" alt="Summed Medtech" width="390" height="30" style="filter:brightness(0) invert(1)">
        <p class="footer-tag">Injection devices, engineered for your molecule.</p>
        <p style="font-size:15px;color:var(--brand-pale)">Sichuang Tower, Changning District, Shanghai, China</p>
      </div>
      <div>
        <h4>Platforms</h4>
        <ul>
          <li><a href="{DEPTH}products/simject/index.html">Simject</a></li>
          <li><a href="{DEPTH}products/esimject/index.html">eSimject</a></li>
          <li><a href="{DEPTH}products/multtipen/index.html">Multtipen</a></li>
          <li><a href="{DEPTH}products/syrpen/index.html">Syrpen</a></li>
          <li><a href="{DEPTH}products/esyrpen/index.html">eSyrpen</a></li>
          <li><a href="{DEPTH}products/dual-chamber/index.html">Dual Chamber</a></li>
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="{DEPTH}capabilities/index.html">Capabilities</a></li>
          <li><a href="{DEPTH}news/index.html">News</a></li>
          <li><a href="{DEPTH}about/index.html">About</a></li>
          <li><a href="{DEPTH}contact/index.html">Contact</a></li>
          <li><a href="mailto:alex.chong@summed-medtech.com">alex.chong@summed-medtech.com</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-legal">
      <span>© 2026 Summed Medtech. All rights reserved.</span>
      <!-- ICP -->
    </div>
  </div>
</footer>
```

## Head block

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="{DEPTH}assets/css/site.css">
<script src="{DEPTH}assets/js/site.js" defer></script>
```
