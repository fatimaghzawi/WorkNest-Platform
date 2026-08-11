/**
 * Robust authenticated captures — wait out "Checking session…"
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
  await page.waitForFunction(
    () => !document.body?.innerText?.includes('Checking session'),
    { timeout: 45000 },
  ).catch(() => {});
  await page.waitForTimeout(1200);
  // Prefer seeing app chrome
  await page.waitForSelector('text=Log out, text=CLIENT, text=FREELANCER, nav, header', {
    timeout: 20000,
  }).catch(() => {});
  await page.waitForTimeout(800);
}

async function login(page, email, roleHint) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await waitReady(page);
  // If already redirected to dashboard, fine
  if (!page.url().includes('/login')) {
    await waitReady(page);
    return;
  }
  await page.locator('input[type="email"], input[name="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(new RegExp(`/${roleHint}`), { timeout: 30000 }).catch(() => {});
  await waitReady(page);
  // Extra settle for SPA data
  await page.waitForTimeout(2000);
}

async function shot(page, name) {
  await waitReady(page);
  // Reject bad captures
  const bad = await page.evaluate(() => {
    const t = document.body?.innerText || '';
    return t.includes('Checking session') || t.includes('Welcome back') && t.includes('Sign in');
  });
  if (bad) {
    console.warn('⚠ skip bad frame', name, page.url());
    return false;
  }
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log('✓', name, Math.round(fs.statSync(file).size / 1024) + 'kb', page.url().replace(BASE, ''));
  return true;
}

async function gotoShot(page, url, name) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  await waitReady(page);
  await page.waitForTimeout(1500);
  await shot(page, name);
}

async function openWorkspace(page, prefix) {
  await gotoShot(page, `${BASE}/${prefix}/workspace`, `${prefix === 'client' ? 'client' : 'freelancer'}-workspace-overview`);

  const select = page.locator('select.wn-workspace__project-select, .wn-workspace__toolbar select').first();
  if (await select.count()) {
    const opts = await select.locator('option').all();
    if (opts.length) {
      const value = await opts[0].getAttribute('value');
      if (value) {
        await select.selectOption(value);
        await page.waitForTimeout(2500);
      }
    }
  }
  await waitReady(page);
  await shot(page, `${prefix === 'client' ? 'client' : 'freelancer'}-kanban`);

  const board = page.locator('.wn-kanban, [class*="Kanban"], .wn-workspace').first();
  if (await board.count()) {
    await board.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(400);
  }
  await shot(page, `${prefix === 'client' ? 'client' : 'freelancer'}-kanban-board`);

  // Deliverables tab
  const del = page.getByRole('tab', { name: /deliverable/i }).or(page.locator('button:has-text("Task deliverables")')).first();
  if (await del.count()) {
    await del.click();
    await page.waitForTimeout(1200);
    await shot(page, `${prefix === 'client' ? 'client' : 'freelancer'}-task-deliverables`);
  }

  const files = page.getByRole('tab', { name: /project files|project/i }).or(page.locator('button:has-text("Project files")')).first();
  if (await files.count()) {
    await files.click();
    await page.waitForTimeout(1200);
    await shot(page, `${prefix === 'client' ? 'client' : 'freelancer'}-project-files`);
  }

  const task = page.locator('.wn-task-card').first();
  if (await task.count()) {
    await task.click();
    await page.waitForTimeout(1500);
    await shot(page, `${prefix === 'client' ? 'client' : 'freelancer'}-task-modal`);
    // attachments area in modal
    await page.locator('text=/attach|upload|file|deliverable/i').first().scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(400);
    await shot(page, `${prefix === 'client' ? 'client' : 'freelancer'}-task-attachments`);
    await page.keyboard.press('Escape').catch(() => {});
  }
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

  // Landing (public)
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await shot(page, 'landing');

  // CLIENT
  await login(page, 'client1@worknest.com', 'client');
  await gotoShot(page, `${BASE}/client/dashboard`, 'client-dashboard');
  await gotoShot(page, `${BASE}/client/jobs/new`, 'client-create-job');
  await gotoShot(page, `${BASE}/client/jobs`, 'client-jobs');

  // Matching proposals — click first job proposals link if present
  const prop = page.locator('a[href*="/proposals"]').first();
  if (await prop.count()) {
    await prop.click();
    await waitReady(page);
    await page.waitForTimeout(1500);
    await shot(page, 'client-matching-proposals');
  } else {
    await shot(page, 'client-matching-proposals'); // still jobs page as fallback content
  }

  await gotoShot(page, `${BASE}/client/interviews`, 'client-interviews');
  await gotoShot(page, `${BASE}/client/projects`, 'client-projects');
  await openWorkspace(page, 'client');
  await gotoShot(page, `${BASE}/client/payments`, 'client-payments');

  // FREELANCER — fresh context to avoid cookie bleed issues
  await ctx.clearCookies();
  const p2 = await ctx.newPage();
  await login(p2, 'freelancer1@worknest.com', 'freelancer');
  await gotoShot(p2, `${BASE}/freelancer/dashboard`, 'freelancer-dashboard');
  await gotoShot(p2, `${BASE}/freelancer/jobs`, 'freelancer-jobs');

  const jobLink = p2.locator('a[href*="/freelancer/jobs/"]').first();
  if (await jobLink.count()) {
    await jobLink.click();
    await waitReady(p2);
    await p2.waitForTimeout(1800);
    await shot(p2, 'freelancer-job-detail');
  }

  await gotoShot(p2, `${BASE}/freelancer/proposals`, 'freelancer-proposals');
  await gotoShot(p2, `${BASE}/freelancer/projects`, 'freelancer-projects');
  await openWorkspace(p2, 'freelancer');
  await gotoShot(p2, `${BASE}/freelancer/wallet`, 'freelancer-wallet');
  await p2.evaluate(() => window.scrollBy(0, 320)).catch(() => {});
  await p2.waitForTimeout(600);
  await shot(p2, 'freelancer-wallet-detail');

  await browser.close();
  console.log('Done →', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
