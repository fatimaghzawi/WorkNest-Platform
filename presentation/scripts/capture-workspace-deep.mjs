/**
 * Deep UI capture: matching, kanban, attachments, wallet.
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
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(900);
  await page.locator('input[type="email"], input[name="email"]').first().fill(email);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(2800);
}

async function shot(page, name) {
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
  console.log('✓', name, Math.round(fs.statSync(path.join(OUT, `${name}.png`)).size / 1024) + 'kb');
}

async function goto(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1800);
}

async function openWorkspaceDeep(page, rolePrefix, prefix) {
  await goto(page, `${BASE}/${rolePrefix}/workspace`);
  await shot(page, `${prefix}-workspace-overview`);

  // Select first project if dropdown exists
  const select = page.locator('select.wn-workspace__project-select, .wn-workspace__toolbar select').first();
  if (await select.count()) {
    const options = await select.locator('option').all();
    if (options.length > 0) {
      const value = await options[0].getAttribute('value');
      if (value) {
        await select.selectOption(value);
        await page.waitForTimeout(2000);
      }
    }
  }

  await shot(page, `${prefix}-kanban`);

  // Scroll kanban into view / board area
  const board = page.locator('.wn-kanban, .wn-workspace__board, [class*="kanban"]').first();
  if (await board.count()) {
    await board.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(500);
    await shot(page, `${prefix}-kanban-board`);
  }

  // Task deliverables tab
  const deliverables = page.getByRole('tab', { name: /deliverable/i }).first();
  if (await deliverables.count()) {
    await deliverables.click();
    await page.waitForTimeout(1200);
    await shot(page, `${prefix}-task-deliverables`);
  } else {
    const btn = page.locator('button:has-text("Task deliverables"), button:has-text("Deliverables")').first();
    if (await btn.count()) {
      await btn.click();
      await page.waitForTimeout(1200);
      await shot(page, `${prefix}-task-deliverables`);
    }
  }

  // Project files tab
  const projectFiles = page.getByRole('tab', { name: /project/i }).first();
  if (await projectFiles.count()) {
    await projectFiles.click();
    await page.waitForTimeout(1200);
    await shot(page, `${prefix}-project-files`);
  } else {
    const btn = page.locator('button:has-text("Project files"), button:has-text("Project")').first();
    if (await btn.count()) {
      await btn.click();
      await page.waitForTimeout(1200);
      await shot(page, `${prefix}-project-files`);
    }
  }

  // Open first task card for attachment detail
  const task = page.locator('.wn-task-card, [class*="task-card"]').first();
  if (await task.count()) {
    await task.click();
    await page.waitForTimeout(1400);
    await shot(page, `${prefix}-task-modal`);
    // Try attachments section inside modal
    const att = page.locator('text=/attachment|deliverable|upload|file/i').first();
    if (await att.count()) {
      await att.scrollIntoViewIfNeeded().catch(() => {});
      await page.waitForTimeout(400);
      await shot(page, `${prefix}-task-attachments`);
    }
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(400);
  }
}

async function main() {
  const browser = await chromium.launch({
    channel: process.env.BROWSER_CHANNEL || 'chrome',
    headless: true,
  });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1.5,
  });
  const page = await ctx.newPage();

  // —— Client ——
  await login(page, 'client1@worknest.com');
  await goto(page, `${BASE}/client/dashboard`);
  await shot(page, 'client-dashboard');
  await goto(page, `${BASE}/client/jobs`);
  await shot(page, 'client-jobs');

  // Matching: open first job's proposals if any
  const proposalLink = page.locator('a[href*="/proposals"], button:has-text("Proposal")').first();
  if (await proposalLink.count()) {
    await proposalLink.click();
    await page.waitForTimeout(1800);
    await shot(page, 'client-matching-proposals');
  } else {
    // fallback: try listing jobs and navigate
    const jobCard = page.locator('a[href*="/client/jobs/"]').first();
    if (await jobCard.count()) {
      const href = await jobCard.getAttribute('href');
      if (href && href.includes('/jobs/')) {
        const id = href.split('/jobs/')[1]?.split('/')[0];
        if (id && id !== 'new') {
          await goto(page, `${BASE}/client/jobs/${id}/proposals`);
          await shot(page, 'client-matching-proposals');
        }
      }
    }
  }

  await goto(page, `${BASE}/client/interviews`);
  await shot(page, 'client-interviews');
  await goto(page, `${BASE}/client/projects`);
  await shot(page, 'client-projects');
  await openWorkspaceDeep(page, 'client', 'client');
  await goto(page, `${BASE}/client/payments`);
  await shot(page, 'client-payments');

  // —— Freelancer ——
  await ctx.clearCookies();
  const p2 = await ctx.newPage();
  await login(p2, 'freelancer1@worknest.com');
  await goto(p2, `${BASE}/freelancer/dashboard`);
  await shot(p2, 'freelancer-dashboard');
  await goto(p2, `${BASE}/freelancer/jobs`);
  await shot(p2, 'freelancer-jobs');

  // Matching: open a job detail
  const job = p2.locator('a[href*="/freelancer/jobs/"], .wn-job-ticket a, article a').first();
  if (await job.count()) {
    await job.click();
    await page.waitForTimeout(0);
    await p2.waitForTimeout(2000);
    await shot(p2, 'freelancer-job-detail');
  }

  await goto(p2, `${BASE}/freelancer/proposals`);
  await shot(p2, 'freelancer-proposals');
  await goto(p2, `${BASE}/freelancer/projects`);
  await shot(p2, 'freelancer-projects');
  await openWorkspaceDeep(p2, 'freelancer', 'freelancer');
  await goto(p2, `${BASE}/freelancer/wallet`);
  await shot(p2, 'freelancer-wallet');

  // Scroll wallet sections if present
  await p2.evaluate(() => window.scrollTo(0, 400)).catch(() => {});
  await p2.waitForTimeout(500);
  await shot(p2, 'freelancer-wallet-detail');

  await browser.close();
  console.log('Done →', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
