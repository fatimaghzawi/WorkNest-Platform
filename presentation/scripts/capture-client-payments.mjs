/**
 * Capture client payments / escrow deposit screen only.
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
    .waitForFunction(() => !document.body?.innerText?.includes('Checking session'), { timeout: 45000 })
    .catch(() => {});
  await page.waitForTimeout(900);
  await page
    .waitForSelector('text=Log out, text=CLIENT, text=FREELANCER, nav, header', { timeout: 20000 })
    .catch(() => {});
}

async function login(page, email, roleHint) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitReady(page);
  if (!page.url().includes('/login')) return;
  await page.locator('input[type="email"], input[name="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(new RegExp(`/${roleHint}`), { timeout: 30000 }).catch(() => {});
  await waitReady(page);
  await page.waitForTimeout(1200);
}

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log('✓', name, Math.round(fs.statSync(file).size / 1024) + 'kb', page.url().replace(BASE, ''));
}

async function main() {
  const browser = await chromium.launch({
    channel: process.env.BROWSER_CHANNEL || 'chrome',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  await login(page, 'client1@worknest.com', 'client');

  for (const pathUrl of ['/client/payments', '/client/wallet', '/client/projects']) {
    await page.goto(`${BASE}${pathUrl}`, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
    await waitReady(page);
    await page.waitForTimeout(1400);
    const text = await page.evaluate(() => document.body?.innerText?.slice(0, 400) || '');
    console.log('—', pathUrl, text.replace(/\s+/g, ' ').slice(0, 120));
  }

  await page.goto(`${BASE}/client/payments`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitReady(page);
  await page.waitForTimeout(1600);
  await shot(page, 'client-payments');

  // Deposit / escrow detail if a fund/deposit CTA exists
  const depositBtn = page
    .locator('button:has-text("Deposit"), a:has-text("Deposit"), button:has-text("Fund"), button:has-text("Pay")')
    .first();
  if (await depositBtn.count()) {
    await depositBtn.click().catch(() => {});
    await page.waitForTimeout(1500);
    await shot(page, 'client-deposit');
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
