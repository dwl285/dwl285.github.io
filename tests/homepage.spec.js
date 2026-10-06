import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { stat } from 'node:fs/promises';

const projects = [
  ['Dot', 'https://dot.dandotlee.com'],
  ['Writer', 'https://writer.dandotlee.com'],
  ['Marlow', 'https://agentshopper.uk'],
  ['Practice Card', 'https://practice.dandotlee.com'],
];

test('has unchanged project content and title links to the four working destinations', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Daniel Lee — Personal projects');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Daniel Lee');
  await expect(page.locator('.intro-copy')).toHaveCount(0);
  const visibleText = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  expect(visibleText).not.toContain(['A small home for', 'personal projects.'].join(' '));
  expect(visibleText).not.toContain(['Two projects, one place', 'to find them.'].join(' '));
  await expect(page.locator('.project-card')).toHaveCount(4);
  for (const [name, href] of projects) {
    const link = page.getByRole('link', { name, exact: true });
    await expect(link).toHaveAttribute('href', href);
    await expect(page.getByRole('heading', { level: 2, name, exact: true }).getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
    await expect(link).not.toHaveAttribute('target', '_blank');
  }
  await expect(page.locator('a[href^="https:"]')).toHaveCount(4);
  await expect(page.getByRole('link', { name: /^Open / })).toHaveCount(0);
  await expect(page.locator('.project-link, .project-title-link svg')).toHaveCount(0);
  await expect(page.locator('.project-title-link')).toHaveCount(4);
  await expect(page.getByText('Project access may require sign-in.')).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Projects', exact: true })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(4);
});

test('Dot, Writer, Marlow and Practice Card are sibling project cards with independent links', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.project-grid > article.project-card');
  await expect(cards).toHaveCount(4);
  await expect(page.locator('.project-grid article')).toHaveCount(4);
  await expect(cards.locator('h2')).toHaveText(['Dot.', 'Writer', 'Marlow', 'Practice Card']);
  for (const [index, [name, href]] of projects.entries()) {
    await expect(cards.nth(index).getByRole('link')).toHaveCount(1);
    await expect(cards.nth(index).getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
  }
  const marlowLink = page.locator('a[href="https://agentshopper.uk"]');
  await expect(marlowLink).toHaveCount(1);
  await expect(cards.nth(2)).toHaveAttribute('aria-labelledby', 'marlow-title');
  await expect(cards.nth(2).getByRole('heading', { name: 'Marlow', exact: true })).toHaveAttribute('id', 'marlow-title');
  await expect(cards.nth(1).locator('a[href="https://agentshopper.uk"]')).toHaveCount(0);
  await expect(page.locator('article').filter({ has: marlowLink })).toHaveCount(1);
  await expect(cards.nth(2).locator('.project-category, .project-description')).toHaveCount(0);
  const practiceLink = page.locator('a[href="https://practice.dandotlee.com"]');
  await expect(practiceLink).toHaveCount(1);
  await expect(cards.nth(3)).toHaveAttribute('aria-labelledby', 'practice-title');
  await expect(cards.nth(3).getByRole('heading', { name: 'Practice Card', exact: true })).toHaveAttribute('id', 'practice-title');
  await expect(page.locator('article').filter({ has: practiceLink })).toHaveCount(1);
  await expect(cards.nth(3).locator('.project-category, .project-description')).toHaveCount(0);
});

for (const width of [320, 390, 640, 768, 1440]) {
  test(`reflows and has no automated accessibility violations at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const [name] of projects) {
      const box = await page.getByRole('link', { name, exact: true }).boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    const results = await new AxeBuilder({ page }).analyze();
    await testInfo.attach('axe-results', { body: JSON.stringify(results), contentType: 'application/json' });
    expect(results.violations).toEqual([]);
  });
}

test('keyboard skip link, project order, focus indication and activation work', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to projects' });
  await expect(skip).toBeFocused();
  expect((await skip.boundingBox()).y).toBeGreaterThanOrEqual(0);
  await page.keyboard.press('Enter');
  await expect(page.locator('#projects')).toBeFocused();
  for (const [name, href] of projects) {
    await page.keyboard.press('Tab');
    const link = page.getByRole('link', { name, exact: true });
    await expect(link).toBeFocused();
    const outline = await link.evaluate((element) => getComputedStyle(element).outlineStyle);
    expect(outline).toBe('solid');
    expect(await link.evaluate((element) => getComputedStyle(element).textDecorationLine)).toContain('underline');
    // Prove the destination with a local intercepted response, not live app state.
    await page.route(href, (route) => route.fulfill({ body: name }));
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(href);
    await page.goBack();
    await link.focus();
  }
});

test('works without JavaScript and makes no third-party asset requests', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.getByRole('heading', { name: 'Dot', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Writer', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Marlow', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Practice Card', exact: true })).toBeVisible();
  for (const [name, href] of projects) await expect(page.getByRole('link', { name, exact: true })).toHaveAttribute('href', href);
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  expect(await page.locator('script').count()).toBe(0);
  await context.close();
});

test('keeps the homepage asset budget below 20KB, separate from legacy images', async () => {
  const sizes = await Promise.all(['index.html', 'css/home.css', 'assets/favicon.svg'].map(async (file) => (await stat(file)).size));
  expect(sizes.reduce((total, size) => total + size, 0)).toBeLessThan(20 * 1024);
});

test('remains readable with 200% text sizing, forced colors, and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
  await page.goto('/');
  await page.evaluate(() => {
    // Double each rendered text size without changing the viewport.
    const elements = [...document.querySelectorAll('body *')];
    const sizes = elements.map((element) => parseFloat(getComputedStyle(element).fontSize));
    elements.forEach((element, index) => { element.style.fontSize = `${sizes[index] * 2}px`; });
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const [name] of projects) await expect(page.getByRole('link', { name, exact: true })).toBeVisible();
});

test('title hover affordance is visible without changing navigation behavior', async ({ page }) => {
  await page.goto('/');
  for (const [name] of projects) {
    const link = page.getByRole('link', { name, exact: true });
    await link.hover();
    expect(await link.evaluate((element) => getComputedStyle(element).textDecorationLine)).toContain('underline');
    await expect(link).not.toHaveAttribute('onclick');
    await expect(link).not.toHaveAttribute('target');
  }
});
