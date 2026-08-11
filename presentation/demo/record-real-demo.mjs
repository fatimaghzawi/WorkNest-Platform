/**
 * Fast dual-pane LIVE demo (full pages, not top-cropped).
 * LEFT = Freelancer · RIGHT = Client
 *
 * Fixes:
 * - fullPage screenshots so entire dashboards fit in each pane
 * - live typing (visible) but chunked + fewer paints = less lag
 * - short holds + 3x default playback
 * - full hire→pay flow including payments + workspace
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = (process.env.BASE_URL || 'https://work-nest-platform-nu.vercel.app').replace(
  /\/$/,
  '',
);
const OUT_DIR = path.join(__dirname, 'assets');
const VIDEO_NAME = 'worknest-real-demo.webm';
const PASSWORD = process.env.DEMO_PASSWORD || 'Demo1234!';

const STAGE_W = 1600;
const STAGE_H = 900;
const PANEL_W = 1360;
const PANEL_H = 900;
const FPS = 5;

const chapters = [];
let startedAt = 0;
let clockReady = false;
let lastMarkedKey = '';
let frameIndex = 0;
/** @type {'left' | 'right' | 'both'} */
let activePane = 'both';
/** Frames remaining to show the big LIVE pop banner (not wall-clock — screenshots are slow) */
let focusFramesLeft = 0;
let story = {
  role: 'WorkNest',
  title: 'Live marketplace demo',
  body: 'Freelancer left · Client right',
  chipL: 'Ready',
  chipR: 'Ready',
};
let lastLeft = Buffer.alloc(0);
let lastRight = Buffer.alloc(0);
/** @type {string | null} */
let chaptersPath = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function flushChapters() {
  if (!chaptersPath) return;
  fs.writeFileSync(
    chaptersPath,
    JSON.stringify(
      {
        baseUrl: BASE_URL,
        mode: 'frame-synced-pop',
        fps: FPS,
        frames: frameIndex,
        chapters,
      },
      null,
      2,
    ),
  );
}

function mark(role, title, body) {
  if (!clockReady) return;
  const key = `${role}||${title}||${body}`;
  if (key === lastMarkedKey) return;
  lastMarkedKey = key;
  chapters.push({
    // Exact video seconds (frame clock) — no rounding so captions stay locked to the reel
    at: Math.max(0, Number((frameIndex / FPS).toFixed(2))),
    role,
    title,
    body,
  });
  flushChapters();
  console.log(`  [${role}] ${title}`);
}

function findPlaywrightFfmpeg() {
  const roots = [
    path.join(process.env.LOCALAPPDATA || '', 'ms-playwright'),
    path.join(process.env.LOCALAPPDATA || '', 'Temp', 'cursor-sandbox-cache'),
  ];
  for (const root of roots) {
    if (!root || !fs.existsSync(root)) continue;
    const stack = [root];
    while (stack.length) {
      const dir = stack.pop();
      let entries = [];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isFile() && /ffmpeg-win64\.exe$/i.test(ent.name)) return full;
        if (ent.isDirectory() && !ent.name.startsWith('.')) stack.push(full);
      }
    }
  }
  return null;
}

const STAGE_HTML = `<!DOCTYPE html>
<html><head><meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet" />
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{width:${STAGE_W}px;height:${STAGE_H}px;overflow:hidden;font-family:Outfit,system-ui,sans-serif;
background:
  radial-gradient(ellipse 80% 50% at 50% -10%,rgba(110,52,130,.35),transparent 55%),
  radial-gradient(ellipse 50% 40% at 100% 100%,rgba(249,115,22,.12),transparent 50%),
  linear-gradient(165deg,#140a1c 0%,#0c0612 55%,#100818 100%);
color:#f4eef8}
.top{height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;
border-bottom:1px solid rgba(255,255,255,.08);background:rgba(8,4,14,.55);backdrop-filter:blur(10px)}
.brand{display:flex;gap:10px;align-items:center}
.mark{width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#a56abd,#f97316);display:grid;place-items:center;font-family:Poppins,sans-serif;font-weight:700;font-size:14px}
.brand strong{font-family:Poppins,sans-serif;font-size:16px;letter-spacing:-.02em}
.brand span{display:block;font-size:11px;color:#b9a6c9;letter-spacing:.04em}
.story{text-align:right;max-width:68%}
.story .role{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#f97316;font-weight:700}
.story h1{font-family:Poppins,sans-serif;font-size:16px;margin-top:2px;letter-spacing:-.02em}
.story p{font-size:12px;color:#cbb8d8;margin-top:2px}
.grid{position:relative;height:calc(${STAGE_H}px - 56px - 32px);display:grid;grid-template-columns:1fr 52px 1fr;gap:10px;padding:12px 14px 8px;
transition:grid-template-columns .55s cubic-bezier(.16,1,.3,1)}
.pane{position:relative;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,.1);background:#07040c;
opacity:.18;filter:grayscale(.75) saturate(.25) brightness(.55);transform:scale(.78) translateY(14px);
transform-origin:center center;
transition:opacity .5s ease,filter .5s ease,transform .55s cubic-bezier(.16,1,.3,1),box-shadow .45s ease,border-color .4s ease}
.pane.active{opacity:1;filter:none;transform:scale(1.02) translateY(0);z-index:3}
.pane.active.tone-free{border-color:rgba(20,184,166,.9);box-shadow:0 0 0 2px rgba(20,184,166,.45),0 0 48px rgba(20,184,166,.28),0 24px 48px rgba(0,0,0,.55)}
.pane.active.tone-client{border-color:rgba(249,115,22,.9);box-shadow:0 0 0 2px rgba(249,115,22,.5),0 0 48px rgba(249,115,22,.3),0 24px 48px rgba(0,0,0,.55)}
.pane.both{opacity:1;filter:none;transform:scale(1) translateY(0);border-color:rgba(165,106,189,.5);
box-shadow:0 0 0 1px rgba(165,106,189,.35),0 0 36px rgba(165,106,189,.14);z-index:1}
.pane.pop-in-left{animation:popInL .6s cubic-bezier(.16,1,.3,1) both}
.pane.pop-in-right{animation:popInR .6s cubic-bezier(.16,1,.3,1) both}
@keyframes popInL{0%{opacity:.25;transform:scale(.78) translateX(-48px)}100%{opacity:1;transform:scale(1.02) translateX(0)}}
@keyframes popInR{0%{opacity:.25;transform:scale(.78) translateX(48px)}100%{opacity:1;transform:scale(1.02) translateX(0)}}
.wipe{position:absolute;inset:0;z-index:9;pointer-events:none;opacity:0;
background:linear-gradient(105deg,transparent 25%,rgba(249,115,22,.35) 48%,rgba(20,184,166,.35) 52%,transparent 75%)}
.wipe.run-to-right{animation:wipeR .65s ease forwards}
.wipe.run-to-left{animation:wipeL .65s ease forwards}
@keyframes wipeR{0%{opacity:0;transform:translateX(-110%) skewX(-10deg)}40%{opacity:.8}100%{opacity:0;transform:translateX(110%) skewX(-10deg)}}
@keyframes wipeL{0%{opacity:0;transform:translateX(110%) skewX(10deg)}40%{opacity:.8}100%{opacity:0;transform:translateX(-110%) skewX(10deg)}}
.spotlight{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;
background:radial-gradient(ellipse at var(--sx,50%) 45%,transparent 30%,rgba(6,3,10,.68) 72%);transition:opacity .4s ease}
.spotlight.on{opacity:1}
.focus-banner{position:absolute;left:50%;top:14px;transform:translate(-50%,-12px) scale(.92);
z-index:10;pointer-events:none;opacity:0;padding:9px 18px;border-radius:999px;
font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#fff;
border:1px solid rgba(255,255,255,.18);backdrop-filter:blur(8px);
box-shadow:0 12px 32px rgba(0,0,0,.35);transition:opacity .25s ease,transform .4s cubic-bezier(.16,1,.3,1)}
.focus-banner.tone-client{background:rgba(249,115,22,.92)}
.focus-banner.tone-free{background:rgba(20,184,166,.92)}
.focus-banner.show{opacity:1;transform:translate(-50%,0) scale(1)}
.focus-banner.hide-quick{opacity:0;transition:opacity .3s ease}
.live{position:absolute;top:10px;right:10px;z-index:4;display:none;align-items:center;gap:6px;padding:6px 11px;border-radius:999px;
font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#0b1210}
.pane.active.tone-client .live{display:inline-flex;background:#f97316;box-shadow:0 8px 20px rgba(249,115,22,.4)}
.pane.active.tone-free .live{display:inline-flex;background:#14b8a6;box-shadow:0 8px 20px rgba(20,184,166,.4)}
.live i{width:6px;height:6px;border-radius:50%;background:#fff;animation:b .9s infinite}
@keyframes b{50%{opacity:.25}}
.bar{position:absolute;left:0;right:0;bottom:0;height:3px;display:none;background-size:200% 100%;animation:s 1s linear infinite}
.pane.active.tone-client .bar{display:block;background:linear-gradient(90deg,transparent,#f97316,#a56abd,transparent)}
.pane.active.tone-free .bar{display:block;background:linear-gradient(90deg,transparent,#14b8a6,#a56abd,transparent)}
@keyframes s{to{background-position:-200% 0}}
.pane header{position:absolute;top:10px;left:10px;z-index:2;display:flex;gap:6px;align-items:center;padding:5px 10px;border-radius:999px;
background:rgba(8,4,14,.88);font-size:10px;font-weight:700;letter-spacing:.08em}
.dot{width:7px;height:7px;border-radius:50%}
.dot.t{background:#14b8a6}.dot.v{background:#f97316}
.pane img{width:100%;height:100%;object-fit:contain;object-position:center center;background:#07040c;display:block}
.bridge{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;position:relative;z-index:4}
.line{width:1px;flex:1;max-height:90px;background:linear-gradient(180deg,transparent,#a56abd,transparent)}
.pulse{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font-size:9px;font-weight:700;letter-spacing:.06em;
border:1px solid rgba(165,106,189,.5);background:rgba(165,106,189,.14);color:#e9d5f5;transition:transform .35s ease,box-shadow .35s ease}
.pulse.on{background:rgba(249,115,22,.28);border-color:#f97316;box-shadow:0 0 20px rgba(249,115,22,.4);color:#fff;transform:scale(1.08)}
.pulse.swap{animation:pulsePop .5s ease}
@keyframes pulsePop{0%{transform:scale(.85)}55%{transform:scale(1.18)}100%{transform:scale(1.08)}}
.foot{height:32px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;font-size:11px;color:#9a86ad;
border-top:1px solid rgba(255,255,255,.06);background:rgba(8,4,14,.4)}
.chip{padding:3px 8px;border-radius:999px;border:1px solid rgba(255,255,255,.1)}
.chip.hot{border-color:rgba(165,106,189,.45);color:#e9d5f5}
</style></head><body>
<div class="top">
  <div class="brand"><div class="mark">W</div><div><strong>WorkNest</strong><span>Professional marketplace walkthrough</span></div></div>
  <div class="story"><div class="role" id="role">WorkNest</div><h1 id="title">End-to-end hire flow</h1><p id="body">Client right · Freelancer left · live product UI</p></div>
</div>
<div class="grid" id="grid">
  <section class="pane" id="paneL"><header><span class="dot t"></span>FREELANCER</header><span class="live"><i></i>LIVE</span><div class="bar"></div><img id="left" alt=""/></section>
  <div class="bridge"><div class="line"></div><div class="pulse" id="pulse">SYNC</div><div class="line"></div></div>
  <section class="pane" id="paneR"><header><span class="dot v"></span>CLIENT</header><span class="live"><i></i>LIVE</span><div class="bar"></div><img id="right" alt=""/></section>
  <div class="spotlight" id="spotlight"></div>
  <div class="wipe" id="wipe"></div>
  <div class="focus-banner" id="focusBanner">CLIENT</div>
</div>
<div class="foot">
  <div style="display:flex;gap:6px"><span class="chip" id="chipL">—</span><span class="chip hot">LIVE = active role</span><span class="chip" id="chipR">—</span></div>
  <div>Post → Propose → Hire → Escrow → Workspace → Pay</div>
</div>
</body></html>`;

const DEFAULT_ZOOM = 0.62;
const DETAIL_ZOOM = 0.88;
let captureZoom = DEFAULT_ZOOM;

/** Readable zoom by default; detail zoom for attachments/files close-ups */
async function prepCapture(page, zoom = captureZoom) {
  await page.evaluate((z) => {
    window.scrollTo(0, 0);
    document.documentElement.style.zoom = String(z);
    document.querySelectorAll('body, #root, main, [class*="content"], [class*="layout"], [class*="shell"], [class*="scroll"], [class*="page"]').forEach((el) => {
      const node = /** @type {HTMLElement} */ (el);
      node.style.maxHeight = 'none';
      node.style.overflow = 'visible';
    });
  }, zoom).catch(() => {});
}

async function waitReady(page) {
  await page.waitForFunction(
    () => !/Checking session|Signing in/i.test(document.body?.innerText || ''),
    { timeout: 45000 },
  ).catch(() => {});
  await sleep(150);
  await prepCapture(page);
}

async function login(page, email, password) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.locator('input[name="email"]').waitFor({ state: 'visible', timeout: 30000 });
      await page.locator('input[name="email"]').fill(email);
      await page.locator('input[name="password"]').fill(password);
      await Promise.all([
        page.waitForURL(/\/(client|freelancer)\//, { timeout: 90000 }),
        page.getByRole('button', { name: /sign in/i }).click(),
      ]);
      await waitReady(page);
      return;
    } catch (err) {
      console.log(`  login retry ${attempt}/3 for ${email}: ${err.message.split('\n')[0]}`);
      if (attempt === 3) throw err;
      await sleep(2500);
    }
  }
}

async function go(page, route) {
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitReady(page);
}

async function dismissToasts(page) {
  for (let i = 0; i < 6; i += 1) {
    const closes = page.locator('.wn-toast__close, .wn-toast-viewport button');
    const n = await closes.count().catch(() => 0);
    if (!n) break;
    for (let j = 0; j < n; j += 1) {
      await closes.nth(j).click({ force: true }).catch(() => {});
    }
    await sleep(150);
  }
  await page.locator('.wn-toast--error').waitFor({ state: 'detached', timeout: 2500 }).catch(() => {});
}

function jobIdFromUrl(url) {
  const m =
    String(url).match(/\/jobs\/([a-f0-9]{24})/i) ||
    String(url).match(/[?&]jobId=([a-f0-9]{24})/i);
  return m?.[1] || '';
}

async function extractJobId(page) {
  let id = jobIdFromUrl(page.url());
  if (id) return id;
  const href = await page.locator('a[href*="/jobs/"]').first().getAttribute('href').catch(() => '');
  id = jobIdFromUrl(href || '');
  if (id) return id;
  const ws = await page.locator('a[href*="jobId="]').first().getAttribute('href').catch(() => '');
  return jobIdFromUrl(ws || '');
}

async function field(page, labelRe, phRe) {
  const a = page.getByLabel(labelRe).first();
  if (await a.isVisible().catch(() => false)) return a;
  if (phRe) {
    const b = page.getByPlaceholder(phRe).first();
    if (await b.isVisible().catch(() => false)) return b;
  }
  return a;
}

async function tap(page, candidates) {
  for (const c of candidates) {
    const loc = typeof c === 'string' ? page.locator(c).first() : c;
    if (await loc.isVisible().catch(() => false)) {
      await loc.click({ force: true, timeout: 4000 }).catch(() => {});
      await sleep(200);
      await prepCapture(page);
      return true;
    }
  }
  return false;
}

async function openBell(page) {
  await tap(page, [
    page.locator('button.wn-notifications__bell').first(),
    page.locator('button[aria-label*="Notifications"]').first(),
  ]);
}

async function confirm(page, re = /accept|confirm|continue|yes/i) {
  const btn = page.getByRole('button', { name: re }).last();
  if (await btn.isVisible({ timeout: 2500 }).catch(() => false)) {
    await btn.click({ force: true }).catch(() => {});
    await sleep(300);
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const framesDir = path.join(OUT_DIR, '_frames');
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });
  frameIndex = 0;
  chapters.length = 0;
  lastMarkedKey = '';
  chaptersPath = path.join(OUT_DIR, 'chapters.json');

  const jobTitle = 'React Analytics Dashboard — Charts, Filters & PDF Export';
  console.log(`Recording full-page dual demo from ${BASE_URL}`);
  console.log(`Job: ${jobTitle}`);

  const FIXTURES = path.join(OUT_DIR, '_fixtures');
  const fixtureFiles = {
    brief: path.join(FIXTURES, 'project-brief.pdf'),
    brand: path.join(FIXTURES, 'brand-palette.png'),
    wires: path.join(FIXTURES, 'wireframes-v1.pdf'),
  };

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
    args: ['--disable-dev-shm-usage'],
  });

  const opts = { viewport: { width: PANEL_W, height: PANEL_H }, deviceScaleFactor: 1, ignoreHTTPSErrors: true };
  const freeCtx = await browser.newContext(opts);
  const clientCtx = await browser.newContext(opts);
  const free = await freeCtx.newPage();
  const client = await clientCtx.newPage();

  console.log('Login (not recorded)...');
  await login(client, 'client1@worknest.com', PASSWORD);
  await login(free, 'freelancer1@worknest.com', PASSWORD);
  await go(client, '/client/dashboard');
  await go(free, '/freelancer/dashboard');

  const stageCtx = await browser.newContext({
    viewport: { width: STAGE_W, height: STAGE_H },
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: true,
  });
  const stage = await stageCtx.newPage();
  await stage.setContent(STAGE_HTML);
  await sleep(200);
  startedAt = Date.now();
  clockReady = true;
  let demoJobId = '';

  async function shoot(page) {
    await prepCapture(page, captureZoom);
    try {
      return await page.screenshot({ type: 'jpeg', quality: 62, timeout: 12000 });
    } catch {
      return null;
    }
  }

  async function paint(extra = {}) {
    const prevActive = activePane;
    if (extra.active) activePane = extra.active;
    if (typeof extra.zoom === 'number') captureZoom = extra.zoom;
    story = {
      role: extra.role ?? story.role,
      title: extra.title ?? story.title,
      body: extra.body ?? story.body,
      chipL: extra.chipL ?? story.chipL,
      chipR: extra.chipR ?? story.chipR,
    };

    // Captions are marked after the frame is written so timestamps = frameIndex / FPS

    const switched =
      !!extra.active && extra.active !== 'both' && (extra.active !== prevActive || extra.forcePop);
    if (switched) focusFramesLeft = 5; // brief professional focus cue

    if (activePane === 'left') {
      const b = await shoot(free);
      if (b) lastLeft = b;
      if (!lastRight.length) {
        const o = await shoot(client);
        if (o) lastRight = o;
      }
    } else if (activePane === 'right') {
      const b = await shoot(client);
      if (b) lastRight = b;
      if (!lastLeft.length) {
        const o = await shoot(free);
        if (o) lastLeft = o;
      }
    } else {
      const [l, r] = await Promise.all([shoot(free), shoot(client)]);
      if (l) lastLeft = l;
      if (r) lastRight = r;
    }
    if (!lastLeft.length || !lastRight.length) {
      const [l, r] = await Promise.all([shoot(free), shoot(client)]);
      if (l) lastLeft = l;
      if (r) lastRight = r;
    }

    const focusLabel =
      activePane === 'left' ? 'FREELANCER' : activePane === 'right' ? 'CLIENT' : '';
    const focusVisible = activePane !== 'both' && focusFramesLeft > 0;
    const wipeDir =
      switched && activePane === 'left' ? 'run-to-left' : switched && activePane === 'right' ? 'run-to-right' : '';
    const popAnim =
      switched && activePane === 'left' ? 'pop-in-left' : switched && activePane === 'right' ? 'pop-in-right' : '';
    if (focusFramesLeft > 0) focusFramesLeft -= 1;

    await stage.evaluate(
      ({ left, right, role, title, body, chipL, chipR, active, sync, focusLabel, focusVisible, wipeDir, popAnim }) => {
        document.getElementById('left').src = `data:image/jpeg;base64,${left}`;
        document.getElementById('right').src = `data:image/jpeg;base64,${right}`;
        document.getElementById('role').textContent = role;
        document.getElementById('title').textContent = title;
        document.getElementById('body').textContent = body;
        document.getElementById('chipL').textContent = chipL;
        document.getElementById('chipR').textContent = chipR;
        const pulse = document.getElementById('pulse');
        pulse.classList.toggle('on', !!sync);
        pulse.classList.toggle('swap', !!wipeDir);

        const grid = document.getElementById('grid');
        const L = document.getElementById('paneL');
        const R = document.getElementById('paneR');
        const banner = document.getElementById('focusBanner');
        const wipe = document.getElementById('wipe');
        const spot = document.getElementById('spotlight');

        L.className = 'pane';
        R.className = 'pane';

        if (active === 'both') {
          grid.style.gridTemplateColumns = '1fr 52px 1fr';
          L.classList.add('both');
          R.classList.add('both');
          spot.classList.remove('on');
        } else if (active === 'left') {
          grid.style.gridTemplateColumns = '2.55fr 28px 0.2fr';
          L.classList.add('active', 'tone-free');
          if (popAnim) L.classList.add(popAnim);
          spot.style.setProperty('--sx', '28%');
          spot.classList.add('on');
        } else {
          grid.style.gridTemplateColumns = '0.2fr 28px 2.55fr';
          R.classList.add('active', 'tone-client');
          if (popAnim) R.classList.add(popAnim);
          spot.style.setProperty('--sx', '72%');
          spot.classList.add('on');
        }

        wipe.className = 'wipe';
        if (wipeDir) {
          // restart CSS animation
          void wipe.offsetWidth;
          wipe.classList.add(wipeDir);
        }

        banner.classList.remove('tone-free', 'tone-client', 'show', 'hide-quick');
        if (focusVisible && focusLabel) {
          banner.textContent = focusLabel;
          banner.classList.add('show', active === 'left' ? 'tone-free' : 'tone-client');
        } else {
          banner.classList.add('hide-quick');
        }
      },
      {
        left: lastLeft.toString('base64'),
        right: lastRight.toString('base64'),
        ...story,
        active: activePane,
        sync: !!extra.sync,
        focusLabel,
        focusVisible,
        wipeDir,
        popAnim,
      },
    );

    // Capture compositor frame — timestamps = frameIndex / FPS (perfect caption sync)
    const framePath = path.join(framesDir, `frame_${String(frameIndex).padStart(5, '0')}.jpg`);
    try {
      await stage.locator('#grid').screenshot({
        path: framePath,
        type: 'jpeg',
        quality: 68,
        timeout: 20000,
      });
    } catch {
      try {
        await stage.screenshot({ path: framePath, type: 'jpeg', quality: 55, timeout: 20000 });
      } catch {
        const prev = path.join(framesDir, `frame_${String(Math.max(0, frameIndex - 1)).padStart(5, '0')}.jpg`);
        if (fs.existsSync(prev)) fs.copyFileSync(prev, framePath);
      }
    }
    mark(story.role, story.title, story.body);
    frameIndex += 1;
  }

  async function hold(ms, meta = {}) {
    const step = 200;
    const n = Math.max(1, Math.ceil(ms / step));
    for (let i = 0; i < n; i += 1) {
      await paint({ ...meta, sync: meta.sync ?? false });
      await sleep(step);
    }
  }

  async function act(side, role, title, body, chipL, chipR, zoom = DEFAULT_ZOOM) {
    const prev = activePane;
    activePane = side;
    captureZoom = zoom;

    // Creative beat before the pop: brief dual view, then wipe into LIVE
    if (side !== 'both' && prev !== side) {
      await paint({
        active: 'both',
        role,
        title,
        body,
        chipL,
        chipR,
        zoom,
        sync: true,
      });
      await sleep(220);
    }

    await paint({
      active: side,
      role,
      title,
      body,
      chipL,
      chipR,
      zoom,
      sync: side === 'both',
      forcePop: side !== 'both',
    });
    // Hold so wipe + pop animation are visible on camera
    if (side !== 'both') {
      await hold(1100, {
        active: side,
        role,
        title,
        body,
        chipL,
        chipR,
        zoom,
        sync: false,
      });
    }
  }

  async function focusFiles(page, which) {
    // Scroll files panel into view, then open the right tab
    await page.evaluate(() => {
      const panel = document.querySelector('.wn-workspace-files, [class*="workspace-files"]');
      panel?.scrollIntoView({ block: 'center', behavior: 'instant' });
    }).catch(() => {});
    await sleep(200);
    if (which === 'project') {
      await tap(page, [
        page.getByRole('tab', { name: /project files/i }).first(),
        page.getByText(/^project files$/i).first(),
      ]);
    } else {
      await tap(page, [
        page.getByRole('tab', { name: /task deliverables/i }).first(),
        page.getByText(/^task deliverables$/i).first(),
      ]);
    }
    await page.evaluate(() => {
      const panel = document.querySelector('.wn-workspace-files, [class*="workspace-files"]');
      panel?.scrollIntoView({ block: 'center', behavior: 'instant' });
    }).catch(() => {});
  }

  async function setFilter(page, fieldLabel, optionLabel) {
    const field = page.locator('.wn-task-filters__field').filter({ hasText: fieldLabel }).first();
    const select = field.locator('select').first();
    if (await select.isVisible().catch(() => false)) {
      await select.selectOption({ label: optionLabel }).catch(async () => {
        const valueMap = {
          'All tasks': 'all',
          'Client tasks': 'client',
          'Freelancer tasks': 'freelancer',
          Any: 'all',
          High: 'high',
          Medium: 'medium',
          Low: 'low',
          Newest: 'createdAt',
          Deadline: 'dueDate',
          Priority: 'priority',
          Title: 'title',
        };
        await select.selectOption(valueMap[optionLabel] || optionLabel).catch(() => {});
      });
      await sleep(250);
      return true;
    }
    return false;
  }

  async function scrollFilters(page) {
    await page.evaluate(() => {
      document.querySelector('.wn-task-filters, [aria-label="Task filters"]')?.scrollIntoView({
        block: 'center',
        behavior: 'instant',
      });
    }).catch(() => {});
    await sleep(200);
  }

  async function openWorkspace(page) {
    await tap(page, [
      page.getByRole('link', { name: /open|workspace|continue/i }).first(),
      page.locator('[class*="card"]').first(),
    ]);
    await waitReady(page);
  }

  async function goSharedWorkspace(page, role) {
    if (!demoJobId) {
      await go(page, `/${role}/workspace`);
    } else {
      await go(page, `/${role}/workspace?jobId=${demoJobId}`);
    }
    await dismissToasts(page);
    const select = page.locator('.wn-workspace__project-select');
    if (demoJobId && (await select.isVisible().catch(() => false))) {
      await select.selectOption(demoJobId).catch(() => {});
      await sleep(400);
      await waitReady(page);
    }
    await setFilter(page, 'Show', 'All tasks');
    await setFilter(page, 'Priority', 'Any');
    await page
      .getByRole('list', { name: /project kanban board/i })
      .waitFor({ state: 'visible', timeout: 12000 })
      .catch(() => {});
    await dismissToasts(page);
  }

  async function reloadSharedBoth() {
    await Promise.all([goSharedWorkspace(free, 'freelancer'), goSharedWorkspace(client, 'client')]);
  }

  async function dragTaskTo(page, titleRe, columnTitle) {
    const card = page.getByRole('list', { name: /project kanban board/i }).getByRole('button', { name: titleRe }).first();
    const col = page.locator(`section[aria-label="${columnTitle}"] .wn-kanban__column-body`).first();
    if (!(await card.isVisible().catch(() => false))) return false;
    if (!(await col.isVisible().catch(() => false))) return false;
    await card.dragTo(col, { force: true }).catch(() => {});
    await sleep(400);
    return true;
  }

  async function quickAddTask(page, { title, description, priority = 'Medium' }) {
    await dismissToasts(page);
    await tap(page, [page.getByRole('button', { name: /\+?\s*add task/i }).first()]);
    const titleBox = page.getByPlaceholder(/what needs to be done/i).first();
    if (!(await titleBox.isVisible({ timeout: 4000 }).catch(() => false))) return false;
    await titleBox.fill(title, { force: true });
    const descBox = page.getByPlaceholder(/optional scope|acceptance/i).first();
    if (await descBox.isVisible().catch(() => false)) {
      await descBox.fill(description, { force: true });
    }
    await page
      .locator('.wn-field')
      .filter({ hasText: /priority/i })
      .locator('select')
      .selectOption({ label: priority })
      .catch(() => {});
    await tap(page, [page.getByRole('button', { name: /save task/i }).first()]);
    await sleep(500);
    await waitReady(page);
    await dismissToasts(page);
    await page
      .getByRole('list', { name: /project kanban board/i })
      .getByText(title, { exact: false })
      .first()
      .waitFor({ state: 'visible', timeout: 8000 })
      .catch(() => {});
    return true;
  }

  async function tryFundEscrow() {
    await go(client, '/client/projects');
    await dismissToasts(client);
    const deposit = client.getByRole('button', { name: /deposit to escrow/i }).first();
    if (!(await deposit.isVisible().catch(() => false))) return false;
    await deposit.click({ force: true }).catch(() => {});
    await sleep(400);
    const pay = client.getByRole('button', { name: /pay .+ with stripe/i }).first();
    if (!(await pay.isVisible().catch(() => false))) {
      await client.getByRole('button', { name: /^cancel$/i }).click({ force: true }).catch(() => {});
      return false;
    }
    await pay.click({ force: true }).catch(() => {});
    await sleep(2000);
    // Best-effort Stripe test card; ignore failures and dismiss UI
    try {
      const frames = client.frames();
      for (const frame of frames) {
        const num = frame.getByPlaceholder(/card number/i).or(frame.locator('input[name="cardnumber"]')).first();
        if (await num.isVisible({ timeout: 800 }).catch(() => false)) {
          await num.fill('4242424242424242');
          await frame.getByPlaceholder(/mm\s*\/\s*yy|expir/i).or(frame.locator('input[name="exp-date"]')).first().fill('1230').catch(() => {});
          await frame.getByPlaceholder(/cvc|cvv/i).or(frame.locator('input[name="cvc"]')).first().fill('123').catch(() => {});
          await frame.getByRole('button', { name: /pay|submit|complete/i }).first().click({ force: true }).catch(() => {});
          await sleep(4000);
          break;
        }
      }
    } catch {
      /* ignore */
    }
    await dismissToasts(client);
    await client.getByRole('button', { name: /^cancel$/i }).click({ force: true }).catch(() => {});
    await client.locator('[aria-label="Close"]').first().click({ force: true }).catch(() => {});
    await dismissToasts(client);
    return true;
  }

  async function uploadProjectFile(page, filePath) {
    await focusFiles(page, 'project');
    await sleep(200);
    const input = page.locator('input[type="file"]').first();
    if (!(await input.count().catch(() => 0))) {
      await tap(page, [
        page.getByRole('button', { name: /upload project file|^upload$/i }).first(),
      ]);
    }
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.count()) {
      await fileInput.setInputFiles(filePath);
      await sleep(800);
      await waitReady(page);
      return true;
    }
    return false;
  }

  async function scrollProfileSection(page, headingRe) {
    await page.evaluate((reSource) => {
      const re = new RegExp(reSource, 'i');
      const headings = [...document.querySelectorAll('h2, h3, h4')];
      const hit = headings.find((h) => re.test(h.textContent || ''));
      hit?.scrollIntoView({ block: 'center', behavior: 'instant' });
    }, headingRe.source || String(headingRe)).catch(() => {});
    await sleep(250);
  }

  /** Progressive fill — few paints so recording stays smooth */
  async function typeLive(page, locator, text, meta) {
    await locator.click({ force: true, timeout: 5000 }).catch(() => {});
    await paint({ ...meta, title: meta.title || story.title, body: 'Starting to fill…' });
    const thirds = [
      text.slice(0, Math.ceil(text.length / 3)),
      text.slice(0, Math.ceil((2 * text.length) / 3)),
      text,
    ];
    for (const partial of thirds) {
      await locator.fill(partial, { force: true, timeout: 10000 });
      await paint({ ...meta, sync: false });
      await sleep(80);
    }
    await paint({ ...meta, sync: true });
  }

  try {
    await act(
      'both',
      'Both',
      'Client ↔ Freelancer marketplace flow',
      'Dual live dashboards — Orange = Client · Teal = Freelancer',
      'Dashboard',
      'Dashboard',
    );
    await hold(600, { active: 'both', sync: true, zoom: DEFAULT_ZOOM });

    // —— Client posts job ——
    await act('right', 'Client', 'Client posts a new job', 'Typing title, brief, budget, skills & deadline on the real form', 'Watching', 'Writing job');
    await go(client, '/client/jobs/new');
    await hold(300, { active: 'right', zoom: DEFAULT_ZOOM });

    await typeLive(client, await field(client, /job title/i, /react dashboard/i), jobTitle, {
      active: 'right', role: 'Client', title: 'Client types the job title', body: jobTitle, chipL: 'Watching', chipR: 'Title', zoom: DEFAULT_ZOOM,
    });
    await typeLive(
      client,
      await field(client, /description/i, /project scope/i),
      'We need a production-ready React analytics dashboard: KPI cards, interactive charts, advanced filters, and printable PDF export for stakeholders.',
      {
        active: 'right',
        role: 'Client',
        title: 'Client writes the project brief',
        body: 'KPI cards · charts · filters · PDF export',
        chipL: 'Watching',
        chipR: 'Description',
        zoom: DEFAULT_ZOOM,
      },
    );

    const cat = client.locator('#job-category');
    if (await cat.isVisible().catch(() => false)) {
      const opts = await cat.locator('option').allTextContents();
      const pick = opts.find((o) => /web|dev|software|design/i.test(o)) || opts.find((o) => o && !/select/i.test(o));
      if (pick) await cat.selectOption({ label: pick.trim() });
      await paint({ active: 'right', role: 'Client', title: 'Client picks a category', body: pick || 'Category selected', chipR: 'Category', zoom: DEFAULT_ZOOM });
    }

    await typeLive(client, await field(client, /budget/i, null), '2200', {
      active: 'right', role: 'Client', title: 'Client sets the budget', body: '$2,200 USD', chipL: 'Watching', chipR: 'Budget', zoom: DEFAULT_ZOOM,
    });
    await typeLive(client, await field(client, /skills/i, /React/i), 'React, TypeScript, Node.js', {
      active: 'right', role: 'Client', title: 'Client adds required skills', body: 'React · TypeScript · Node.js', chipL: 'Watching', chipR: 'Skills', zoom: DEFAULT_ZOOM,
    });

    const dl = await field(client, /deadline/i, null);
    const day = new Date();
    day.setDate(day.getDate() + 21);
    await dl.fill(day.toISOString().slice(0, 10), { force: true });
    await paint({ active: 'right', role: 'Client', title: 'Client sets the deadline', body: day.toISOString().slice(0, 10), chipR: 'Deadline', zoom: DEFAULT_ZOOM });

    await client.getByRole('button', { name: /create job/i }).click({ force: true });
    await waitReady(client);
    await sleep(800);
    demoJobId = await extractJobId(client);
    if (!demoJobId) {
      await go(client, '/client/jobs');
      await waitReady(client);
      // Prefer the job we just created
      const link = client.getByRole('link', { name: new RegExp(jobTitle.slice(0, 24), 'i') }).first();
      if (await link.isVisible().catch(() => false)) {
        await link.click({ force: true }).catch(() => {});
        await waitReady(client);
      }
      demoJobId = await extractJobId(client);
    }
    console.log(`  jobId: ${demoJobId || '(unknown)'}`);
    await act('right', 'Client', 'Job is published', 'Freelancers can now discover this listing', 'New opening', 'Published');
    await hold(500, { active: 'right', sync: true, zoom: DEFAULT_ZOOM });

    // —— Freelancer proposes ——
    await act('left', 'Freelancer', 'Freelancer browses open jobs', 'Opens the new client listing', 'Browsing jobs', 'Waiting');
    await go(free, '/freelancer/jobs');
    await hold(300, { active: 'left', zoom: DEFAULT_ZOOM });
    if (await free.getByText(jobTitle, { exact: false }).first().isVisible().catch(() => false)) {
      await free.getByText(jobTitle, { exact: false }).first().click({ force: true });
    } else {
      await tap(free, [free.locator('a[href*="/freelancer/jobs/"]').first()]);
    }
    await waitReady(free);
    await hold(350, { active: 'left', zoom: DEFAULT_ZOOM });

    await free.getByRole('button', { name: /submit proposal/i }).first().click({ force: true });
    await free.getByLabel(/cover letter/i).or(free.getByPlaceholder(/Introduce yourself/i)).first().waitFor({ timeout: 10000 });
    await act('left', 'Freelancer', 'Freelancer writes a proposal', 'Filling cover letter, price, and timeline live', 'Writing…', 'Inbox idle');

    await typeLive(
      free,
      await field(free, /cover letter/i, /Introduce yourself/i),
      'I specialize in React analytics products — chart systems, filter UX, and PDF export pipelines. I can deliver a clean, stakeholder-ready MVP in two weeks with clear milestones.',
      {
        active: 'left',
        role: 'Freelancer',
        title: 'Cover letter being typed',
        body: 'Experience + delivery plan for the dashboard',
        chipL: 'Cover letter',
        chipR: 'Waiting',
        zoom: DEFAULT_ZOOM,
      },
    );
    await typeLive(free, await field(free, /price/i, /500/), '1950', {
      active: 'left', role: 'Freelancer', title: 'Freelancer sets proposal price', body: '$1,950 — under client budget', chipL: 'Price', chipR: 'Waiting', zoom: DEFAULT_ZOOM,
    });
    await typeLive(free, await field(free, /timeline/i, /2 weeks/i), '2 weeks', {
      active: 'left', role: 'Freelancer', title: 'Freelancer sets timeline', body: '2 weeks delivery', chipL: 'Timeline', chipR: 'Waiting', zoom: DEFAULT_ZOOM,
    });

    await free.getByRole('button', { name: /^submit proposal$/i }).last().click({ force: true });
    await sleep(600);
    await waitReady(free);
    await act('left', 'Freelancer', 'Proposal submitted', 'Offer is sent — client will get a notification', 'Submitted', 'Alert incoming');
    await hold(450, { active: 'left', sync: true, zoom: DEFAULT_ZOOM });

    // —— Notification ——
    await act('right', 'Client', 'Client gets a notification', 'Opening the bell — new proposal alert', 'Submitted', 'Notifications');
    await go(client, '/client/dashboard');
    await openBell(client);
    await hold(900, { active: 'right', sync: true, zoom: DEFAULT_ZOOM });

    await go(client, demoJobId ? `/client/jobs/${demoJobId}/proposals` : '/client/jobs');
    if (!demoJobId) {
      await tap(client, [client.locator('a[href*="/proposals"]').first(), client.getByText(/proposal/i).first()]);
    }
    await waitReady(client);
    demoJobId = demoJobId || (await extractJobId(client));
    await dismissToasts(client);
    await act('right', 'Client', 'Client reviews the proposal', 'Reading cover letter, price, and timeline', 'Waiting', 'Reviewing');
    await hold(900, { active: 'right', zoom: DEFAULT_ZOOM });

    // —— Profile deep-dive BEFORE interview ——
    await act(
      'right',
      'Client',
      'Client opens the freelancer profile',
      'Vetting track record, skills & portfolio before the interview',
      'Waiting',
      'View profile',
      DEFAULT_ZOOM,
    );
    const profileLink = client.locator('a[href*="/client/freelancers/"]').first();
    await profileLink.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await Promise.all([
      client.waitForURL(/\/client\/freelancers\/[a-f0-9]{24}/i, { timeout: 15000 }).catch(() => {}),
      profileLink.click({ force: true }),
    ]).catch(async () => {
      await tap(client, [
        client.getByRole('link', { name: /^view profile$/i }).first(),
        client.locator('a[href*="/freelancers/"]').first(),
      ]);
    });
    await waitReady(client);
    await dismissToasts(client);
    await client.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
    await client
      .getByRole('heading', { name: /^track record$/i })
      .waitFor({ state: 'visible', timeout: 15000 })
      .catch(() => {});
    await client.locator('.wn-public-profile__track-grid, .wn-profile-hero').first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => {});
    await hold(1600, {
      active: 'right',
      zoom: 0.7,
      role: 'Client',
      title: 'Freelancer profile overview',
      body: 'Win rate · projects completed · skills listed',
      chipL: 'Waiting',
      chipR: 'Profile',
      sync: true,
    });

    await act(
      'right',
      'Client',
      'Reviewing achievements & track record',
      'Proposals sent / won, pending review, active projects',
      'Waiting',
      'Track record',
      DETAIL_ZOOM,
    );
    await scrollProfileSection(client, /track record/i);
    await hold(2000, {
      active: 'right',
      zoom: DETAIL_ZOOM,
      role: 'Client',
      title: 'Track record & achievements',
      body: 'Proof of delivery before scheduling an interview',
      chipL: 'Waiting',
      chipR: 'Achievements',
      sync: true,
    });

    await scrollProfileSection(client, /^skills$/i);
    await hold(1400, {
      active: 'right',
      zoom: DETAIL_ZOOM,
      role: 'Client',
      title: 'Skills on the freelancer profile',
      body: 'Matching React, TypeScript & Node.js to the brief',
      chipL: 'Waiting',
      chipR: 'Skills',
    });

    await scrollProfileSection(client, /portfolio/i);
    await hold(1600, {
      active: 'right',
      zoom: DETAIL_ZOOM,
      role: 'Client',
      title: 'Portfolio & past work',
      body: 'External showcase before the interview invite',
      chipL: 'Waiting',
      chipR: 'Portfolio',
      sync: true,
    });

    // —— Interview ——
    await act('both', 'Sync', 'Client schedules an interview', 'Fit looks strong — invite goes to the freelancer', 'Interviews', 'Scheduling', DEFAULT_ZOOM);
    await Promise.all([go(client, '/client/interviews'), go(free, '/freelancer/interviews')]);
    await hold(300, { active: 'right', zoom: DEFAULT_ZOOM });
    await tap(client, [
      client.getByRole('button', { name: /schedule|new interview|book/i }).first(),
      client.getByText(/schedule interview/i).first(),
    ]);
    await hold(550, { active: 'right', zoom: DEFAULT_ZOOM });

    await act('left', 'Freelancer', 'Freelancer notification arrives', 'Opening alerts / interview calendar', 'Notifications', 'Invite sent');
    await openBell(free);
    await hold(750, { active: 'left', sync: true, zoom: DEFAULT_ZOOM });
    await go(free, '/freelancer/interviews');
    await hold(450, { active: 'left', zoom: DEFAULT_ZOOM });

    // —— Accept proposal (zoomed) → auto deposit modal → project created ——
    await act(
      'right',
      'Client',
      'Client returns to proposals',
      'Ready to accept the winning bid and create the project',
      'Waiting',
      'Proposals',
      DEFAULT_ZOOM,
    );
    await go(client, demoJobId ? `/client/jobs/${demoJobId}/proposals` : '/client/jobs');
    if (!demoJobId) await tap(client, [client.locator('a[href*="/proposals"]').first()]);
    await waitReady(client);
    await dismissToasts(client);
    await hold(700, {
      active: 'right',
      zoom: DEFAULT_ZOOM,
      role: 'Client',
      title: 'Proposal inbox for this job',
      body: 'Review the submitted offer before hiring',
      chipL: 'Waiting',
      chipR: 'Review',
    });

    const acceptBtn = client.getByRole('button', { name: /^accept$/i }).first();
    await acceptBtn.scrollIntoViewIfNeeded().catch(() => {});
    await acceptBtn.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await hold(1400, {
      active: 'right',
      zoom: DETAIL_ZOOM,
      role: 'Client',
      title: 'Zoom: Accept proposal',
      body: 'Client clicks Accept — this hires the freelancer and creates the project',
      chipL: 'Watching',
      chipR: 'Accept',
      sync: true,
    });
    await acceptBtn.click({ force: true }).catch(() => {});
    await sleep(350);

    const confirmDialog = client
      .getByRole('dialog')
      .or(client.locator('.wn-modal, [class*="confirm"], [class*="Confirm"]'))
      .first();
    await confirmDialog.waitFor({ state: 'visible', timeout: 6000 }).catch(() => {});
    await hold(1800, {
      active: 'right',
      zoom: DETAIL_ZOOM,
      role: 'Client',
      title: 'Confirm: Accept proposal',
      body: 'Job moves in progress · a project is created · other bids are rejected',
      chipL: 'Waiting',
      chipR: 'Confirm',
      sync: true,
    });
    await confirm(client, /^accept$/i);
    await sleep(900);
    await waitReady(client);
    demoJobId = demoJobId || (await extractJobId(client));

    // Deposit modal should open automatically after accept
    const depositModal = client
      .locator('.wn-deposit-modal, .wn-modal')
      .filter({ hasText: /deposit|escrow|checkout/i })
      .first();
    const depositVisible = await depositModal
      .waitFor({ state: 'visible', timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    if (depositVisible) {
      await hold(1600, {
        active: 'right',
        zoom: DETAIL_ZOOM,
        role: 'Client',
        title: 'Project created — deposit escrow',
        body: 'Funds are held safely until the client accepts delivery',
        chipL: 'Hired',
        chipR: 'Deposit',
        sync: true,
      });

      const payStripe = client.getByRole('button', { name: /pay .+ with stripe|deposit|checkout|continue/i }).first();
      if (await payStripe.isVisible().catch(() => false)) {
        await hold(1200, {
          active: 'right',
          zoom: DETAIL_ZOOM,
          role: 'Client',
          title: 'Zoom: Deposit to escrow',
          body: 'Client funds the contract amount before work begins',
          chipL: 'Watching',
          chipR: 'Stripe',
          sync: true,
        });
        await payStripe.click({ force: true }).catch(() => {});
        await sleep(1800);
        await hold(1400, {
          active: 'right',
          zoom: DETAIL_ZOOM,
          role: 'Client',
          title: 'Secure Stripe checkout',
          body: 'Escrow deposit protects both client and freelancer',
          chipL: 'Watching',
          chipR: 'Checkout',
          sync: true,
        });

        // Best-effort Stripe test card while zoomed on deposit
        try {
          for (const frame of client.frames()) {
            const num = frame
              .getByPlaceholder(/card number/i)
              .or(frame.locator('input[name="cardnumber"]'))
              .first();
            if (await num.isVisible({ timeout: 900 }).catch(() => false)) {
              await num.fill('4242424242424242');
              await frame
                .getByPlaceholder(/mm\s*\/\s*yy|expir/i)
                .or(frame.locator('input[name="exp-date"]'))
                .first()
                .fill('1230')
                .catch(() => {});
              await frame
                .getByPlaceholder(/cvc|cvv/i)
                .or(frame.locator('input[name="cvc"]'))
                .first()
                .fill('123')
                .catch(() => {});
              await hold(1000, {
                active: 'right',
                zoom: DETAIL_ZOOM,
                role: 'Client',
                title: 'Client completes escrow payment',
                body: 'Test card entered — funding the project contract',
                chipL: 'Watching',
                chipR: 'Paying',
              });
              await frame
                .getByRole('button', { name: /pay|submit|complete/i })
                .first()
                .click({ force: true })
                .catch(() => {});
              await sleep(3500);
              break;
            }
          }
        } catch {
          /* ignore stripe iframe quirks */
        }
      }

      await dismissToasts(client);
      await client.getByRole('button', { name: /^cancel$/i }).click({ force: true }).catch(() => {});
      await client.locator('[aria-label="Close"]').first().click({ force: true }).catch(() => {});
      await dismissToasts(client);
    } else {
      // Fallback: open deposit from projects if auto-modal did not appear
      await act(
        'right',
        'Client',
        'Project created — fund escrow',
        'Opening deposit so the freelancer can start work',
        'Hired',
        'Deposit',
        DETAIL_ZOOM,
      );
      await tryFundEscrow();
      await dismissToasts(client);
    }

    await hold(900, {
      active: 'right',
      zoom: DEFAULT_ZOOM,
      role: 'Client',
      title: 'Escrow funded · hire complete',
      body: 'Proposal accepted, project created, and deposit secured',
      chipL: 'Ready',
      chipR: 'Funded',
      sync: true,
    });

    // Highlight the newly created project on both sides
    await act(
      'right',
      'Client',
      'Highlight: project created',
      'New project appears in My Projects after accept + deposit',
      'Watching',
      'Projects',
      DETAIL_ZOOM,
    );
    await go(client, '/client/projects');
    await dismissToasts(client);
    await client
      .getByText(new RegExp(jobTitle.slice(0, 18), 'i'))
      .first()
      .scrollIntoViewIfNeeded()
      .catch(() => {});
    await hold(1800, {
      active: 'right',
      zoom: DETAIL_ZOOM,
      role: 'Client',
      title: 'Zoom: new project card',
      body: 'Accepted proposal → live project with escrow status',
      chipL: 'Watching',
      chipR: 'Created',
      sync: true,
    });

    await act(
      'left',
      'Freelancer',
      'Freelancer sees the active project',
      'Hire + funded escrow unlocks My Projects on the left',
      'Projects',
      'Funded',
      DETAIL_ZOOM,
    );
    await go(free, '/freelancer/projects');
    await dismissToasts(free);
    await free
      .getByText(new RegExp(jobTitle.slice(0, 18), 'i'))
      .first()
      .scrollIntoViewIfNeeded()
      .catch(() => {});
    await hold(1600, {
      active: 'left',
      zoom: DETAIL_ZOOM,
      role: 'Freelancer',
      title: 'Zoom: hired project unlocked',
      body: 'Freelancer can now open the shared workspace',
      chipL: 'Active',
      chipR: 'Created',
      sync: true,
    });

    // —— WORKSPACE FEATURE HIGHLIGHT (synced jobId + full board) ——
    const focusTask = 'Build interactive chart widgets';
    const boardTasks = [
      { title: 'Kickoff & requirements alignment', description: 'Confirm KPIs, data sources, and stakeholder export needs.', priority: 'High' },
      { title: 'Dashboard information architecture', description: 'Layout KPI cards, chart grid, and filter rail.', priority: 'High' },
      { title: 'Build interactive chart widgets', description: 'Line, bar, and pie charts with responsive tooltips.', priority: 'High' },
      { title: 'Advanced filters & date ranges', description: 'Multi-select filters with URL-persisted state.', priority: 'Medium' },
      { title: 'PDF export pipeline', description: 'Printable stakeholder PDF from the live dashboard view.', priority: 'High' },
      { title: 'QA pass & review pack', description: 'Cross-browser checks and acceptance screenshots.', priority: 'Medium' },
      { title: 'Stakeholder demo rehearsal', description: 'Walkthrough script and sample dataset for the client review.', priority: 'Low' },
      { title: 'Handoff docs & runbook', description: 'README, env notes, and deploy checklist for production.', priority: 'Medium' },
    ];
    const escRe = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    await act('both', 'Sync', 'Shared workspace opens', 'Same jobId — one board for client & freelancer', 'Workspace', 'Workspace');
    await reloadSharedBoth();
    await hold(1400, { active: 'both', sync: true, zoom: DEFAULT_ZOOM });

    await act('both', 'Sync', 'Synced Kanban for this hire', 'Both panes locked to the same project', 'Same job', 'Same job');
    await hold(1600, { active: 'both', sync: true, zoom: DEFAULT_ZOOM });

    // Client fills the FULL board (works even if escrow is still pending)
    await act('right', 'Client', 'Client fills the Kanban board', 'Adding the full sprint backlog onto the shared board', 'Watching', 'Add tasks', DEFAULT_ZOOM);
    await goSharedWorkspace(client, 'client');
    for (const t of boardTasks) {
      await quickAddTask(client, t);
      await paint({
        active: 'right',
        role: 'Client',
        title: 'Adding: ' + t.title,
        body: t.description,
        chipL: 'Watching',
        chipR: t.priority,
        zoom: DEFAULT_ZOOM,
        sync: false,
      });
      await sleep(150);
      await dismissToasts(client);
    }
    await hold(1400, {
      active: 'right',
      sync: true,
      role: 'Client',
      title: 'Kanban filled with sprint tasks',
      body: `${boardTasks.length} cards now on the shared board`,
      chipL: 'Synced',
      chipR: 'Full board',
      zoom: DEFAULT_ZOOM,
    });

    // Freelancer reloads SAME jobId so both show identical work
    await act('left', 'Freelancer', 'Freelancer reloads the same workspace', 'Same jobId → same tasks appear on the left', 'Loading…', 'Board ready', DEFAULT_ZOOM);
    await goSharedWorkspace(free, 'freelancer');
    await free.getByText(boardTasks[0].title, { exact: false }).first().waitFor({ state: 'visible', timeout: 12000 }).catch(() => {});
    await dismissToasts(free);
    await hold(1200, { active: 'left', sync: true, zoom: DEFAULT_ZOOM });

    await act('both', 'Sync', 'Both sides see the same work', 'Identical Kanban — client & freelancer stay in sync', 'Full board', 'Full board');
    await reloadSharedBoth();
    await hold(2200, { active: 'both', sync: true, zoom: DEFAULT_ZOOM });

    // Spread cards across columns (client can move own tasks)
    await act('right', 'Client', 'Organizing the board', 'Moving cards across To do → In progress → Done', 'Watching', 'Workflow', DEFAULT_ZOOM);
    await dragTaskTo(client, /Kickoff & requirements/i, 'Done');
    await dragTaskTo(client, new RegExp(escRe(focusTask), 'i'), 'In progress');
    await dragTaskTo(client, /Advanced filters/i, 'In progress');
    await dragTaskTo(client, /PDF export/i, 'In progress');
    await hold(1400, {
      active: 'right',
      sync: true,
      zoom: DEFAULT_ZOOM,
      role: 'Client',
      title: 'Board columns filled with real progress',
      body: 'Done + In progress + To do — a living sprint',
      chipL: 'Synced',
      chipR: 'Progress',
    });

    await act('left', 'Freelancer', 'Freelancer sees the updated board', 'Reload keeps both sides on the same columns', 'In sync', 'Updated', DEFAULT_ZOOM);
    await goSharedWorkspace(free, 'freelancer');
    await hold(1400, { active: 'left', sync: true, zoom: DEFAULT_ZOOM });

    await act('both', 'Sync', 'Live synced workspace', 'Same tasks, same columns — one nest', 'Synced', 'Synced');
    await reloadSharedBoth();
    await hold(1800, { active: 'both', sync: true, zoom: DEFAULT_ZOOM });

    // Filters on the busy board
    await act('right', 'Client', 'Client filters the busy board', 'Priority & sort on a filled Kanban', 'Watching', 'Filters', DEFAULT_ZOOM);
    await scrollFilters(client);
    await setFilter(client, 'Priority', 'High');
    await hold(1000, {
      active: 'right',
      role: 'Client',
      title: 'Filter: High priority',
      body: 'Focus the sprint on urgent cards',
      chipL: 'Filtered',
      chipR: 'High',
      zoom: DEFAULT_ZOOM,
    });
    await setFilter(client, 'Sort by', 'Priority');
    await hold(900, {
      active: 'right',
      sync: true,
      role: 'Client',
      title: 'Sorted by priority',
      body: 'High-priority work rises first',
      chipL: 'Synced',
      chipR: 'Sorted',
      zoom: DEFAULT_ZOOM,
    });
    await setFilter(client, 'Priority', 'Any');

    await act('left', 'Freelancer', 'Opening full task details', 'Title, description, priority & deliverables', 'Details', 'Watching', DETAIL_ZOOM);
    await setFilter(free, 'Priority', 'Any');
    await tap(free, [
      free
        .getByRole('list', { name: /project kanban board/i })
        .getByRole('button', { name: new RegExp(escRe(focusTask), 'i') })
        .first(),
    ]);
    await hold(1600, {
      active: 'left',
      zoom: DETAIL_ZOOM,
      role: 'Freelancer',
      title: 'Task detail modal',
      body: 'Full scope visible to both collaborators',
      chipL: 'Details',
      chipR: 'Watching',
      sync: true,
    });
    await tap(free, [free.getByRole('button', { name: /cancel|close/i }).first()]);
    await dismissToasts(free);
    await hold(350, { active: 'left', zoom: DEFAULT_ZOOM });

    // Attachments — freelancer upload (needs escrow held; dismiss errors if blocked)
    await act(
      'left',
      'Freelancer',
      'Uploading project attachments',
      'Brief, brand palette & wireframes into Project files',
      'Upload',
      'Watching',
      DETAIL_ZOOM,
    );
    await goSharedWorkspace(free, 'freelancer');
    let uploadsOk = 0;
    for (const [label, filePath] of [
      ['project brief', fixtureFiles.brief],
      ['brand palette', fixtureFiles.brand],
      ['wireframes', fixtureFiles.wires],
    ]) {
      if (!fs.existsSync(filePath)) continue;
      const ok = await uploadProjectFile(free, filePath);
      await dismissToasts(free);
      if (ok) {
        uploadsOk += 1;
        await hold(800, {
          active: 'left',
          zoom: DETAIL_ZOOM,
          role: 'Freelancer',
          title: `Uploaded: ${label}`,
          body: 'Shared into Project files for the client',
          chipL: 'Attachments',
          chipR: 'Watching',
          sync: true,
        });
      }
    }
    await focusFiles(free, 'project');
    await hold(1600, {
      active: 'left',
      zoom: DETAIL_ZOOM,
      role: 'Freelancer',
      title: uploadsOk ? 'Project files library filled' : 'Project files panel',
      body: uploadsOk
        ? 'Brief · brand · wireframes ready for the client'
        : 'Files panel ready once escrow is held',
      chipL: 'Files',
      chipR: 'Synced',
      sync: true,
    });
    await dismissToasts(free);

    await act(
      'right',
      'Client',
      'Client inspects the shared workspace',
      'Same board + project files on the hiring side',
      'Files ready',
      'Review',
      DETAIL_ZOOM,
    );
    await goSharedWorkspace(client, 'client');
    await focusFiles(client, 'project');
    await hold(2000, {
      active: 'right',
      zoom: DETAIL_ZOOM,
      role: 'Client',
      title: 'Client reviews project attachments',
      body: 'Shared library — briefs, assets, docs',
      chipL: 'Synced',
      chipR: 'Attachments',
      sync: true,
    });
    await focusFiles(client, 'deliverables');
    await hold(1400, {
      active: 'right',
      zoom: DETAIL_ZOOM,
      role: 'Client',
      title: 'Task deliverables library',
      body: 'Per-task submissions for acceptance',
      chipL: 'Synced',
      chipR: 'Deliverables',
      sync: true,
    });
    await dismissToasts(client);

    await act(
      'both',
      'Sync',
      'Workspace wrap-up',
      'One jobId · full Kanban · shared files — real synced workflow',
      'Workspace',
      'Workspace',
      DEFAULT_ZOOM,
    );
    await reloadSharedBoth();
    await hold(1800, { active: 'both', sync: true, zoom: DEFAULT_ZOOM });

    // —— Delivery → pay ——
    await act('left', 'Freelancer', 'Freelancer delivery progress', 'Projects list — path to request review', 'Delivery', 'Waiting', DEFAULT_ZOOM);
    await go(free, '/freelancer/projects');
    await hold(550, { active: 'left', zoom: DEFAULT_ZOOM });
    await tap(free, [
      free.getByRole('button', { name: /complete|request review|submit/i }).first(),
      free.getByText(/request review|complete project/i).first(),
    ]);
    await hold(400, { active: 'left', zoom: DEFAULT_ZOOM });

    await act('right', 'Client', 'Client accepts delivery', 'Releases escrow payment to the freelancer', 'Payout soon', 'Accept delivery', DEFAULT_ZOOM);
    await go(client, '/client/projects');
    await hold(550, { active: 'right', zoom: DEFAULT_ZOOM });
    await tap(client, [
      client.getByRole('button', { name: /accept delivery/i }).first(),
      client.getByText(/accept delivery/i).first(),
    ]);
    await confirm(client, /accept delivery|^accept$/i);
    await hold(600, { active: 'right', sync: true, zoom: DEFAULT_ZOOM });

    await act('left', 'Freelancer', 'Freelancer wallet / earnings', 'Payment appears after escrow release', 'Wallet', 'Paid', DEFAULT_ZOOM);
    await go(free, '/freelancer/wallet');
    await hold(700, { active: 'left', sync: true, zoom: DEFAULT_ZOOM });

    await act('right', 'Client', 'Client payments history', 'Escrow deposit & release trail', 'Done', 'Payments', DEFAULT_ZOOM);
    await go(client, '/client/payments');
    await hold(700, { active: 'right', sync: true, zoom: DEFAULT_ZOOM });

    await act('both', 'WorkNest', 'Complete hire-to-pay journey', 'Post → Propose → Notify → Hire → Escrow → Workspace → Pay', 'Complete', 'Complete', DEFAULT_ZOOM);
    await hold(900, { active: 'both', sync: true, zoom: DEFAULT_ZOOM });
  } finally {
    await stageCtx.close().catch(() => {});
    await freeCtx.close().catch(() => {});
    await clientCtx.close().catch(() => {});
    await browser.close().catch(() => {});
  }

  if (frameIndex < 5) throw new Error(`Too few frames captured: ${frameIndex}`);

  flushChapters();

  const ff = findPlaywrightFfmpeg();
  if (!ff) throw new Error('Playwright ffmpeg not found. Run: npx playwright install ffmpeg');

  // Playwright's ffmpeg build only has image2pipe (not image2/%d sequences).
  // Also avoid absolute paths with spaces — write to a temp file then move.
  const dest = path.join(OUT_DIR, VIDEO_NAME);
  const tmpOut = path.join(process.env.TEMP || process.env.TMP || OUT_DIR, `worknest-demo-${Date.now()}.webm`);
  console.log(`Encoding ${frameIndex} frames @ ${FPS}fps → ${dest}`);

  await new Promise((resolve, reject) => {
    const child = spawn(
      ff,
      [
        '-y',
        '-f',
        'image2pipe',
        '-framerate',
        String(FPS),
        '-c:v',
        'mjpeg',
        '-i',
        'pipe:0',
        '-c:v',
        'libvpx',
        '-b:v',
        '3.5M',
        '-auto-alt-ref',
        '0',
        tmpOut,
      ],
      { stdio: ['pipe', 'inherit', 'inherit'] },
    );
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
    (async () => {
      try {
        for (let i = 0; i < frameIndex; i += 1) {
          const fp = path.join(framesDir, `frame_${String(i).padStart(5, '0')}.jpg`);
          if (!fs.existsSync(fp)) throw new Error(`Missing frame: ${fp}`);
          const ok = child.stdin.write(fs.readFileSync(fp));
          if (!ok) await new Promise((r) => child.stdin.once('drain', r));
        }
        child.stdin.end();
      } catch (err) {
        child.kill();
        reject(err);
      }
    })();
  });

  fs.copyFileSync(tmpOut, dest);
  fs.rmSync(tmpOut, { force: true });
  fs.rmSync(framesDir, { recursive: true, force: true });
  flushChapters();
  console.log(`Saved ${dest} (${Math.round(fs.statSync(dest).size / 1024 / 1024)} MB)`);
  console.log(`Chapters: ${chapters.length} · duration ~${(frameIndex / FPS).toFixed(1)}s`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
