/**
 * Capture focused workspace zooms: tasks board, filters, attachments.
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
  await page.waitForTimeout(800);
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

async function shotEl(page, locator, name) {
  const el = locator.first();
  if (!(await el.count())) {
    console.warn('⚠ missing', name);
    return false;
  }
  await el.scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(400);
  const file = path.join(OUT, `${name}.png`);
  await el.screenshot({ path: file });
  console.log('✓', name, Math.round(fs.statSync(file).size / 1024) + 'kb');
  return true;
}

async function openWorkspace(page) {
  await page.goto(`${BASE}/freelancer/workspace`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await waitReady(page);
  await page.waitForTimeout(1500);
  const select = page.locator('select.wn-workspace__project-select, .wn-workspace__toolbar select').first();
  if (await select.count()) {
    const opts = await select.locator('option').all();
    if (opts.length) {
      const value = await opts[0].getAttribute('value');
      if (value) {
        await select.selectOption(value);
        await page.waitForTimeout(2000);
      }
    }
  }
}

async function main() {
  const browser = await chromium.launch({
    channel: process.env.BROWSER_CHANNEL || 'chrome',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  await login(page, 'freelancer1@worknest.com', 'freelancer');
  await openWorkspace(page);

  // Full page context
  await page.screenshot({ path: path.join(OUT, 'workspace-spotlight-overview.png'), fullPage: false });
  console.log('✓ overview');

  // Filters bar
  const filters = page.locator('.wn-task-filters, [class*="TaskBoardFilters"], .wn-workspace__filters').first();
  if (!(await shotEl(page, filters, 'workspace-spotlight-filters'))) {
    // fallback: locate by SHOW label
    const byText = page.locator('text=SHOW').locator('xpath=ancestor::*[contains(@class,\"filter\") or contains(@class,\"Filter\")][1]');
    await shotEl(page, byText, 'workspace-spotlight-filters');
  }

  // Kanban / tasks board
  const board = page.locator('.wn-kanban, [class*="KanbanBoard"], .wn-workspace__board').first();
  await shotEl(page, board, 'workspace-spotlight-tasks');

  // Attachments / deliverables panel
  const deliverables = page
    .locator('.wn-workspace-attachments, [class*="deliverable"], text=Task deliverables')
    .first();
  const panel = page.locator('.wn-workspace__sidebar, aside, [class*="Sidebar"]').first();
  if (await page.getByRole('tab', { name: /deliverable/i }).count()) {
    await page.getByRole('tab', { name: /deliverable/i }).first().click().catch(() => {});
    await page.waitForTimeout(600);
  }
  if (!(await shotEl(page, deliverables, 'workspace-spotlight-attachments'))) {
    await shotEl(page, panel, 'workspace-spotlight-attachments');
  }

  // Also capture project files tab
  if (await page.getByRole('tab', { name: /project files/i }).count()) {
    await page.getByRole('tab', { name: /project files/i }).first().click().catch(() => {});
    await page.waitForTimeout(600);
    await shotEl(page, panel, 'workspace-spotlight-project-files');
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
