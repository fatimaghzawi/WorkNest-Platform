/**
 * Capture client → freelancer public profile (+ refresh interviews).
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

async function waitReady(page) {
  await page
    .waitForFunction(() => !document.body?.innerText?.includes('Checking session'), {
      timeout: 45000,
    })
    .catch(() => {});
  await page.waitForTimeout(1000);
  await page
    .waitForSelector('text=Log out, text=CLIENT, text=FREELANCER, nav, header', { timeout: 20000 })
    .catch(() => {});
  await page.waitForTimeout(600);
}

async function login(page, email, roleHint) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitReady(page);
  if (!page.url().includes('/login')) {
    await waitReady(page);
    return;
  }
  await page.locator('input[type="email"], input[name="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(new RegExp(`/${roleHint}`), { timeout: 30000 }).catch(() => {});
  await waitReady(page);
  await page.waitForTimeout(1500);
}

async function shot(page, name) {
  await waitReady(page);
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log('✓', name, Math.round(fs.statSync(file).size / 1024) + 'kb', page.url().replace(BASE, ''));
}

async function main() {
  const browser = await chromium.launch({
    channel: process.env.BROWSER_CHANNEL || 'chrome',
    headless: true,
  });
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();

  await login(page, 'client1@worknest.com', 'client');
  await page.goto(`${BASE}/client/jobs`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitReady(page);

  const prop = page.locator('a[href*="/proposals"]').first();
  if (await prop.count()) {
    await prop.click();
    await waitReady(page);
    await page.waitForTimeout(1200);
    await shot(page, 'client-matching-proposals');
  }

  // Open public freelancer profile from proposals list
  const profileLink = page
    .locator(
      'a[href*="/client/freelancers/"], a:has-text("View profile"), button:has-text("View profile"), a:has-text("Alex")',
    )
    .first();
  if (await profileLink.count()) {
    await profileLink.click();
    await waitReady(page);
    await page.waitForTimeout(1800);
    await shot(page, 'client-freelancer-profile');
  } else {
    // Fallback: scrape first freelancer id from any link on page
    const href = await page.evaluate(() => {
      const a = [...document.querySelectorAll('a[href*="/client/freelancers/"]')][0];
      return a?.getAttribute('href') || '';
    });
    if (href) {
      await page.goto(`${BASE}${href.startsWith('http') ? new URL(href).pathname : href}`, {
        waitUntil: 'domcontentloaded',
      });
      await waitReady(page);
      await page.waitForTimeout(1800);
      await shot(page, 'client-freelancer-profile');
    } else {
      console.warn('⚠ could not find freelancer profile link');
    }
  }

  await page.goto(`${BASE}/client/interviews`, { waitUntil: 'domcontentloaded' });
  await waitReady(page);
  await page.waitForTimeout(1200);
  await shot(page, 'client-interviews');

  const ctx2 = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });
  const p2 = await ctx2.newPage();
  await login(p2, 'freelancer1@worknest.com', 'freelancer');
  await p2.goto(`${BASE}/freelancer/interviews`, { waitUntil: 'domcontentloaded' });
  await waitReady(p2);
  await p2.waitForTimeout(1200);
  await shot(p2, 'user-interviews');

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
