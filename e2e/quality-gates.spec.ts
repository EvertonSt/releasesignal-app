import { test, expect } from './fixtures';

test.describe('Quality Gates', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quality-gates');
    await page.waitForLoadState('networkidle');
  });

  test('page heading renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Quality Gates');
  });

  test('all 3 gates render', async ({ page }) => {
    await expect(page.getByText('Production Release Gate')).toBeVisible();
    await expect(page.getByText('Staging Deployment Gate')).toBeVisible();
    await expect(page.getByText('Pull Request Gate')).toBeVisible();
  });

  test('gate descriptions render', async ({ page }) => {
    await expect(page.getByText('Required for all production deployments')).toBeVisible();
    await expect(page.getByText('Required for staging deployments')).toBeVisible();
    await expect(page.getByText('Automated check for all pull requests')).toBeVisible();
  });

  test('gate statuses render', async ({ page }) => {
    await expect(page.getByText('pass').first()).toBeVisible();
    await expect(page.getByText('warning').first()).toBeVisible();
  });

  test('gate rules are visible', async ({ page }) => {
    await expect(page.getByText(/failure rate/i).first()).toBeVisible();
    await expect(page.getByText(/flaky rate/i).first()).toBeVisible();
  });

  test('demo banner persists', async ({ page }) => {
    await expect(page.getByText(/demo mode/i)).toBeVisible();
  });

  test('responsive: gates stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.getByText('Production Release Gate')).toBeVisible();
  });
});
