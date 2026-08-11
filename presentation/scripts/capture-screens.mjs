/**
 * Capture real WorkNest UI screenshots for the presentation.
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
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(800);
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const passInput = page.locator('input[type="password"]').first();
  await emailInput.fill(email);
  await passInput.fill(PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(2500);
}

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log('saved', name);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.25,
  });
  const page = await ctx.newPage();

  // Landing
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await shot(page, 'landing');

  // Client flow
  await login(page, 'client1@worknest.com');
  await page.goto(`${BASE}/client`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(2000);
  await shot(page, 'client-dashboard');

  await page.goto(`${BASE}/client/jobs/create`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(1500);
  await shot(page, 'client-create-job');

  await page.goto(`${BASE}/client/jobs`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page.waitForTimeout(1500);
  await shot(page, 'client-jobs');

  // Try proposals / payments / projects
  for (const [url, name] of [
    [`${BASE}/client/projects`, 'client-projects'],
    [`${BASE}/client/payments`, 'client-payments'],
    [`${BASE}/client/workspace`, 'client-workspace'],
  ]) {
    await page.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForTimeout(1400);
    await shot(page, name);
  }

  // Freelancer
  await ctx.clearCookies();
  const page2 = await ctx.newPage();
  await login(page2, 'freelancer1@worknest.com');
  await page2.goto(`${BASE}/freelancer`, { waitUntil: 'domcontentloaded' }).catch(() => {});
  await page2.waitForTimeout(2000);
  await shot(page2, 'freelancer-dashboard');

  for (const [url, name] of [
    [`${BASE}/freelancer/jobs`, 'freelancer-jobs'],
    [`${BASE}/freelancer/proposals`, 'freelancer-proposals'],
    [`${BASE}/freelancer/projects`, 'freelancer-projects'],
    [`${BASE}/freelancer/workspace`, 'freelancer-workspace'],
    [`${BASE}/freelancer/wallet`, 'freelancer-wallet'],
  ]) {
    await page2.goto(url, { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page2.waitForTimeout(1400);
    await shot(page2, name);
  }

  await browser.close();
  console.log('done →', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
