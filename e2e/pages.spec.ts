import { test, expect } from './fixtures';

test.describe('Flaky Tests Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/flaky-tests');
    await page.waitForLoadState('networkidle');
  });

  test('page heading renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Flaky Test');
  });

  test('displays flaky test entries', async ({ page }) => {
    await expect(page.getByText('should render dashboard widgets').first()).toBeVisible();
    await expect(page.getByText('should complete payment flow').first()).toBeVisible();
  });

  test('shows flake rate percentages', async ({ page }) => {
    await expect(page.getByText('23%').first()).toBeVisible();
  });

  test('shows quarantine controls', async ({ page }) => {
    await expect(page.getByText(/quarantine/i).first().or(page.getByText(/active/i).first())).toBeVisible();
  });

  test('demo banner persists', async ({ page }) => {
    await expect(page.getByText(/demo mode/i)).toBeVisible();
  });
});

test.describe('Pull Requests Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pull-requests');
    await page.waitForLoadState('networkidle');
  });

  test('page heading renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Pull Request');
  });

  test('displays PR quality reports', async ({ page }) => {
    await expect(page.getByText(/PR.*#/i).first().or(page.getByText(/pull request/i).first())).toBeVisible();
  });

  test('shows gate decisions', async ({ page }) => {
    await expect(page.getByText(/pass|warning|blocked/i).first()).toBeVisible();
  });

  test('demo banner persists', async ({ page }) => {
    await expect(page.getByText(/demo mode/i)).toBeVisible();
  });
});

test.describe('Performance Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/performance');
    await page.waitForLoadState('networkidle');
  });

  test('page heading renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Performance');
  });

  test('displays duration charts', async ({ page }) => {
    const charts = page.locator('.recharts-responsive-container');
    expect(await charts.count()).toBeGreaterThanOrEqual(1);
  });

  test('shows p50/p95 metrics', async ({ page }) => {
    await expect(page.getByText('p50').first().or(page.getByText('duration').first())).toBeVisible();
  });

  test('shows performance budget reference', async ({ page }) => {
    await expect(page.getByText(/budget|120s/i).first()).toBeVisible();
  });

  test('demo banner persists', async ({ page }) => {
    await expect(page.getByText(/demo mode/i)).toBeVisible();
  });

  test('responsive: charts render on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('.recharts-responsive-container').first()).toBeVisible();
  });
});

test.describe('Reports Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
  });

  test('page heading renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Reports');
  });

  test('displays report entries', async ({ page }) => {
    await expect(page.locator('[class*="rounded-xl border bg-card"]').first()).toBeVisible();
  });

  test('shows report types', async ({ page }) => {
    await expect(page.getByText(/release|weekly|flaky|regression/i).first()).toBeVisible();
  });

  test('demo banner persists', async ({ page }) => {
    await expect(page.getByText(/demo mode/i)).toBeVisible();
  });
});

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('page heading renders', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Settings');
  });

  test('displays setting sections', async ({ page }) => {
    await expect(page.getByText(/organization|team|integrations|api|notifications|branding/i).first()).toBeVisible();
  });

  test('demo banner persists', async ({ page }) => {
    await expect(page.getByText(/demo mode/i)).toBeVisible();
  });

  test('responsive: settings on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator('h1')).toContainText('Settings');
  });
});
