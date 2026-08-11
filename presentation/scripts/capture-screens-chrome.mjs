/**
 * Capture WorkNest UI using installed Chrome.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.env.BASE_URL || 'https://work-nest-platform-nu.vercel.app').replace(/\/$/, '');
const OUT = path.join(__dirname, '../public/screenshots');
const PASSWORD = process.env.DEMO_PASSWORD || 'Demo1234!';

fs.mkdirSync(OUT, { recursive: true });

async function login(page, email) {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(1200);
  await page.locator('input[type="email"], input[name="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await Promise.all([
    page.waitForURL(/\/(client|freelancer)/, { timeout: 20000 }).catch(() => {}),
    page.locator('button[type="submit"]').first().click(),
  ]);
  await page.waitForTimeout(2500);
}

async function shot(page, name) {
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
  const size = fs.statSync(path.join(OUT, `${name}.png`)).size;
  console.log(`✓ ${name} (${Math.round(size / 1024)}kb) · ${page.url()}`);
}

async function gotoShot(page, url, name) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1800);
  await shot(page, name);
}

async function runWithChannel(channel) {
  const browser = await chromium.launch({ channel, headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });
  const page = await ctx.newPage();

  await gotoShot(page, BASE, 'landing');

  await login(page, 'client1@worknest.com');
  await gotoShot(page, `${BASE}/client/dashboard`, 'client-dashboard');
  await gotoShot(page, `${BASE}/client/jobs/new`, 'client-create-job');
  await gotoShot(page, `${BASE}/client/jobs`, 'client-jobs');
  await gotoShot(page, `${BASE}/client/projects`, 'client-projects');
  await gotoShot(page, `${BASE}/client/payments`, 'client-payments');
  await gotoShot(page, `${BASE}/client/workspace`, 'client-workspace');

  await ctx.clearCookies();
  const p2 = await ctx.newPage();
  await login(p2, 'freelancer1@worknest.com');
  await gotoShot(p2, `${BASE}/freelancer/dashboard`, 'freelancer-dashboard');
  await gotoShot(p2, `${BASE}/freelancer/jobs`, 'freelancer-jobs');
  await gotoShot(p2, `${BASE}/freelancer/proposals`, 'freelancer-proposals');
  await gotoShot(p2, `${BASE}/freelancer/projects`, 'freelancer-projects');
  await gotoShot(p2, `${BASE}/freelancer/workspace`, 'freelancer-workspace');
  await gotoShot(p2, `${BASE}/freelancer/wallet`, 'freelancer-wallet');

  await browser.close();
}

async function main() {
  const channel = process.env.BROWSER_CHANNEL || 'chrome';
  try {
    await runWithChannel(channel);
  } catch (e) {
    console.error(channel, 'failed:', e.message);
    await runWithChannel('msedge');
  }
  console.log('Screenshots →', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
