#!/usr/bin/env python3
"""
check-site.py — Summed website 交付门 (scrolling-page fork of check-html.py)
用法:
  python3 tools/check-site.py <html文件>
输出: 各检查 PASS/FAIL; 任一 FAIL 则 exit 1

七项检查:
  1. H-OVERFLOW      — 水平溢出 (scrollWidth > viewport, 元素越出左右边界)
  2. OVERLAP         — 叶子文本元素两两 bbox 相交
  3. CLIPPED         — 固定高度容器内文本被截断
  4. IMG             — 图片加载失败 / 渲染比例扭曲 (>15%)
  5. EMPTY           — 正文可见文本 <200 字符 或元素 <30
  6. VIEWPORTS       — 1440/1280/1024/768/390 宽度下无水平溢出
  7. CONTENT-POLICY  — 禁用词 (Multtiject / multi-dose / cartridge / 已上市类表述)
"""
import asyncio, sys, pathlib, glob, os

FORBIDDEN = ['multtiject', 'multi-dose', '多剂量', 'cartridge', '卡式瓶', '已注册', '已批准', '已上市']

VIEWPORTS = [(1440, 900), (1280, 800), (1024, 768), (768, 1024), (390, 844)]


def find_chromium():
    pats = [
        os.path.expanduser('~/Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-mac-arm64/chrome-headless-shell'),
        os.path.expanduser('~/Library/Caches/ms-playwright/chromium-*/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium'),
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ]
    for pat in pats:
        hits = sorted(glob.glob(pat), reverse=True)
        if hits and os.path.exists(hits[0]):
            return hits[0]
    return None


CHECK_JS = """() => {
  const out = {hoverflow: [], overlap: [], clipped: [], img: [], textLen: 0, nels: 0};
  const vw = window.innerWidth;
  const root = document.body;
  if (!root) return {err: 'no body'};
  out.nels = root.querySelectorAll('*').length;
  out.textLen = (root.innerText || '').replace(/\\s+/g, ' ').trim().length;

  // ---- 1. horizontal overflow ----
  if (document.documentElement.scrollWidth > vw + 2) {
    out.hoverflow.push(`document scrollWidth ${document.documentElement.scrollWidth} > viewport ${vw}`);
  }
  root.querySelectorAll('*').forEach(el => {
    if (el.closest('[data-deco]')) return;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) === 0) return;
    const b = el.getBoundingClientRect();
    if (b.width < 2 || b.height < 2) return;
    if (b.left < -2 || b.right > vw + 2) {
      out.hoverflow.push(`${el.tagName.toLowerCase()}.${(el.className+'').split(' ')[0]} L${Math.round(b.left)} R${Math.round(b.right)} vw=${vw} "${(el.textContent||'').trim().slice(0,18)}"`);
    }
  });

  // ---- 2. text-text overlap (fragment-level via Range client rects) ----
  const frags = [];
  root.querySelectorAll('*').forEach(el => {
    if (el.children.length > 0) return;
    if (!(el.textContent || '').trim()) return;
    const st = getComputedStyle(el);
    if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) === 0) return;
    let rects = [];
    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      rects = Array.from(range.getClientRects()).filter(r => r.width > 4 && r.height > 4);
    } catch (e) { return; }
    rects.forEach(r => frags.push({el, r}));
  });
  for (let i = 0; i < frags.length; i++) {
    for (let j = i + 1; j < frags.length; j++) {
      const A = frags[i], B = frags[j];
      if (A.el === B.el) continue;
      if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
      const ix = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left);
      const iy = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
      if (ix > 6 && iy > 6) {
        out.overlap.push(`"${A.el.textContent.trim().slice(0,14)}" x "${B.el.textContent.trim().slice(0,14)}" @${Math.round(ix)}x${Math.round(iy)}px`);
      }
    }
  }

  // ---- 3. text clipped by fixed-size overflow-hidden ancestor ----
  root.querySelectorAll('*').forEach(el => {
    if (!(el.textContent || '').trim() || el.children.length > 0) return;
    let p = el.parentElement;
    while (p && p !== root.parentElement) {
      const ps = getComputedStyle(p);
      if ((ps.overflow === 'hidden' || ps.overflowY === 'hidden') && parseInt(ps.height) > 0) {
        const pb = p.getBoundingClientRect(), eb = el.getBoundingClientRect();
        if (eb.bottom > pb.bottom + 2 || eb.top < pb.top - 2) {
          out.clipped.push(`"${el.textContent.trim().slice(0,16)}" clipped in ${p.tagName.toLowerCase()}.${(p.className+'').split(' ')[0]}`);
          break;
        }
      }
      p = p.parentElement;
    }
  });

  // ---- 4. images (scroll into view, then load + distortion) ----
  root.querySelectorAll('img').forEach(img => {
    if (!img.complete || img.naturalWidth === 0) { out.img.push(`FAIL-load ${img.getAttribute('src')?.slice(0,60)||''}`); return; }
  });
  out.imgRatioChecks = Array.from(root.querySelectorAll('img')).filter(i => i.complete && i.naturalWidth > 0).map(i => i.getAttribute('src') || '');

  return out;
}"""

RATIO_JS = """(src) => {
  const img = Array.from(document.querySelectorAll('img')).find(i => (i.getAttribute('src')||'') === src);
  if (!img) return null;
  img.scrollIntoView({block: 'center'});
  const b = img.getBoundingClientRect();
  if (b.width < 2) return null;
  const hasRot = /rotate\\(/.test(img.style.transform) || /rotate\\(/.test(getComputedStyle(img).transform);
  const ofit = getComputedStyle(img).objectFit;
  if (ofit === 'contain' || ofit === 'cover' || ofit === 'scale-down' || ofit === 'none') return null;
  let nw = img.naturalWidth, nh = img.naturalHeight;
  if (hasRot) [nw, nh] = [nh, nw];
  const natRatio = nw / nh, renRatio = b.width / b.height;
  if (Math.abs(natRatio - renRatio) / natRatio > 0.15) {
    return `DISTORT ${src.slice(0,40)} nat=${natRatio.toFixed(2)} ren=${renRatio.toFixed(2)}${hasRot?'(rot)':''}`;
  }
  return null;
}"""

POLICY_JS = """(terms) => {
  const text = (document.body.innerText || '').toLowerCase();
  const hits = [];
  for (const t of terms) {
    if (text.includes(t.toLowerCase())) hits.push(t);
  }
  return hits;
}"""


async def check_page(pg):
    """Returns list of issue strings for the loaded page at pg's current viewport."""
    issues = []
    r = await pg.evaluate(CHECK_JS)
    if 'err' in r:
        return [f"ERR {r['err']}"]

    issues += [f"H-OVERFLOW {x}" for x in r.get('hoverflow', [])]
    issues += [f"OVERLAP   {x}" for x in r.get('overlap', [])]
    issues += [f"CLIPPED   {x}" for x in r.get('clipped', [])]
    issues += [f"IMG       {x}" for x in r.get('img', [])]

    for src in r.get('imgRatioChecks', []):
        dist = await pg.evaluate(RATIO_JS, src)
        if dist:
            issues.append(f"IMG       {dist}")

    if r['textLen'] < 200:
        issues.append(f"EMPTY     visible text {r['textLen']} chars (<200)")
    if r['nels'] < 30:
        issues.append(f"EMPTY     {r['nels']} elements (<30)")

    hits = await pg.evaluate(POLICY_JS, FORBIDDEN)
    for t in hits:
        issues.append(f"CONTENT-POLICY forbidden term: {t}")
    return issues


async def main():
    html_path = pathlib.Path(sys.argv[1]).resolve()
    if not html_path.exists():
        print(f"no such file: {html_path}"); sys.exit(2)
    from playwright.async_api import async_playwright

    fail_total = 0
    async with async_playwright() as p:
        exe = find_chromium()
        b = await p.chromium.launch(executable_path=exe) if exe else await p.chromium.launch()

        pg = await b.new_page(viewport={'width': VIEWPORTS[0][0], 'height': VIEWPORTS[0][1]})
        await pg.goto(f'file://{html_path}')
        await pg.wait_for_timeout(1200)
        try:
            await pg.evaluate('document.fonts.ready')
        except Exception:
            pass
        issues = await check_page(pg)

        if issues:
            fail_total += len(issues)
            for x in issues[:20]:
                print(f"[FAIL] {x}")
            if len(issues) > 20:
                print(f"       ... +{len(issues)-20} more")
        else:
            print("[PASS] page checks: H-OVERFLOW / OVERLAP / CLIPPED / IMG / EMPTY / CONTENT-POLICY")

        print("\n[适配] viewport horizontal-overflow:")
        for (vwp, vhp) in VIEWPORTS:
            pg2 = await b.new_page(viewport={'width': vwp, 'height': vhp})
            await pg2.goto(f'file://{html_path}')
            await pg2.wait_for_timeout(700)
            sw = await pg2.evaluate('document.documentElement.scrollWidth')
            iw = await pg2.evaluate('window.innerWidth')
            await pg2.close()
            ok = sw <= iw + 2
            status = 'OK ' if ok else 'BAD'
            if not ok:
                fail_total += 1
            print(f"    [{status}] {vwp}x{vhp}: scrollWidth={sw} innerWidth={iw}")

        await b.close()

    print(f"\n== RESULT: {'ALL PASS' if fail_total == 0 else f'{fail_total} CHECK(S) FAILED'} ==")
    sys.exit(1 if fail_total else 0)


asyncio.run(main())
