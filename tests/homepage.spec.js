import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { stat } from 'node:fs/promises';

const projects = [
  ['Open Dot', 'https://dot.dandotlee.com'],
  ['Open Writer', 'https://writer-dwl285.fly.dev/'],
];

test('has honest project content and the two working destinations', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Daniel Lee — Personal projects');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.locator('.project-card')).toHaveCount(2);
  for (const [name, href] of projects) {
    const link = page.getByRole('link', { name, exact: true });
    await expect(link).toHaveAttribute('href', href);
    await expect(link).not.toHaveAttribute('target', '_blank');
  }
  await expect(page.locator('a[href^="https:"]')).toHaveCount(2);
  await expect(page.getByText('Project access may require sign-in.')).toBeVisible();
});

for (const width of [320, 390, 640, 768, 1440]) {
  test(`reflows and has no automated accessibility violations at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const [name] of projects) {
      const box = await page.getByRole('link', { name, exact: true }).boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
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
