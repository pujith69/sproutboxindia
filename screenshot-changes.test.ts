import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://sproutboxindia.vercel.app';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

test.describe.configure({ timeout: 60000 });

test.describe('SproutBox A/B Testing Changes', () => {
  test('homepage - full page', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-homepage-full.png'),
      fullPage: true
    });
  });

  test('hero section - control variant', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const hero = page.locator('#hero, section:first-of-type').first();
    await hero.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-hero-control.png')
    });
  });

  test('hero section - variant B (forced)', async ({ page }) => {
    await page.goto(`${BASE_URL}/?sb_force=hero_headline:b`, { waitUntil: 'networkidle' });
    const hero = page.locator('#hero, section:first-of-type').first();
    await hero.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-hero-variant-b.png')
    });
  });

  test('consent banner', async ({ page }) => {
    // Clear storage to show banner
    await page.context().clearCookies();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const banner = page.locator('text=We value your privacy').first();
    if (await banner.isVisible({ timeout: 5000 })) {
      await banner.screenshot({
        path: path.join(SCREENSHOT_DIR, '04-consent-banner.png')
      });
    } else {
      console.log('Consent banner not visible (may have been accepted previously)');
    }
  });

  test('footer with language switcher', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const footer = page.locator('footer').first();
    await footer.screenshot({
      path: path.join(SCREENSHOT_DIR, '05-footer-language-switcher.png')
    });
  });

  test('features section', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const features = page.locator('#features').first();
    await features.screenshot({
      path: path.join(SCREENSHOT_DIR, '06-features-section.png')
    });
  });

  test('benefits section', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const benefits = page.locator('#benefits').first();
    await benefits.screenshot({
      path: path.join(SCREENSHOT_DIR, '07-benefits-section.png')
    });
  });

  test('how it works section', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const howItWorks = page.locator('#how-it-works').first();
    await howItWorks.screenshot({
      path: path.join(SCREENSHOT_DIR, '08-how-it-works-section.png')
    });
  });

  test('CTA section', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const cta = page.locator('#cta').first();
    await cta.screenshot({
      path: path.join(SCREENSHOT_DIR, '09-cta-section.png')
    });
  });

  test('navigation bar', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const nav = page.locator('nav').first();
    await nav.screenshot({
      path: path.join(SCREENSHOT_DIR, '10-navbar.png')
    });
  });

  test('problem section', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const problem = page.locator('#problem').first();
    await problem.screenshot({
      path: path.join(SCREENSHOT_DIR, '11-problem-section.png')
    });
  });

  test('solution section', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const solution = page.locator('#solution').first();
    await solution.screenshot({
      path: path.join(SCREENSHOT_DIR, '12-solution-section.png')
    });
  });
});