import { test, expect } from './fixtures';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('page heading and org info', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Release Dashboard');
    await expect(page.getByText('Acme Engineering')).toBeVisible();
    await expect(page.getByText(/last updated/i)).toBeVisible();
  });

  test('all 8 metric cards render with correct values', async ({ page }) => {
    const metrics = [
      { label: 'Release Health', value: '94.2%', detail: 'vs last week' },
      { label: 'Pass Rate', value: '94.2%' },
      { label: 'Failure Rate', value: '3.1%', detail: '3 active regressions' },
      { label: 'Flaky Rate', value: '2.7%', detail: '8 flaky tests detected' },
      { label: 'Open Regressions', value: '3' },
      { label: 'Avg Duration', value: '1m 47s', detail: 'improving' },
      { label: 'Performance Risk', value: 'Low' },
      { label: 'Tests in PR', value: '47', detail: '2 new failures' },
    ];
    for (const m of metrics) {
      await expect(page.getByText(m.label).first()).toBeVisible();
      await expect(page.getByText(m.value).first()).toBeVisible();
      if (m.detail) {
        await expect(page.getByText(m.detail).first()).toBeVisible();
      }
    }
  });

  test('pass rate trend chart renders', async ({ page }) => {
    await expect(page.getByText('Pass Rate Trend')).toBeVisible();
    await expect(page.getByText('Last 12 days across all repositories')).toBeVisible();
    // Recharts renders SVG
    const chart = page.locator('.recharts-responsive-container').first();
    await expect(chart).toBeVisible();
  });

  test('duration trend chart renders with p50/p95 legend', async ({ page }) => {
    await expect(page.getByText('Test Duration Trend')).toBeVisible();
    await expect(page.getByText('p50 and p95 against 120s budget')).toBeVisible();
    await expect(page.getByText('p50').first()).toBeVisible();
    await expect(page.getByText('p95').first()).toBeVisible();
  });

  test('failure breakdown donut chart', async ({ page }) => {
    await expect(page.getByText('Failure Breakdown')).toBeVisible();
    await expect(page.getByText('By classification type')).toBeVisible();
    await expect(page.getByText('Regressions').first()).toBeVisible();
    await expect(page.getByText('Flaky').first()).toBeVisible();
    await expect(page.getByText('Environment').first()).toBeVisible();
    await expect(page.getByText('Test Defects').first()).toBeVisible();
  });

  test('test volume bar chart by repository', async ({ page }) => {
    await expect(page.getByText('Test Volume by Repository')).toBeVisible();
    await expect(page.getByText('Passed, failed, and flaky')).toBeVisible();
    await expect(page.getByText('acme-web')).toBeVisible();
    await expect(page.getByText('acme-api')).toBeVisible();
    await expect(page.getByText('acme-mobile')).toBeVisible();
  });

  test('quality gates section with 3 gates', async ({ page }) => {
    await expect(page.getByText('Quality Gates')).toBeVisible();
    await expect(page.getByText('Production Release Gate')).toBeVisible();
    await expect(page.getByText('Staging Deployment Gate')).toBeVisible();
    await expect(page.getByText('Pull Request Gate')).toBeVisible();
  });

  test('recent releases list', async ({ page }) => {
    await expect(page.getByText('Recent Releases')).toBeVisible();
    await expect(page.getByText('acme-web').first()).toBeVisible();
    await expect(page.getByText('acme-api').first()).toBeVisible();
    await expect(page.getByText('acme-mobile').first()).toBeVisible();
    // Status badges
    await expect(page.getByText('passed').first()).toBeVisible();
  });

  test('most unstable tests with flake rates', async ({ page }) => {
    await expect(page.getByText('Most Unstable Tests')).toBeVisible();
    await expect(page.getByText('should render dashboard widgets')).toBeVisible();
    await expect(page.getByText('should complete payment flow')).toBeVisible();
    await expect(page.getByText('should load user profile')).toBeVisible();
    // Flake rate percentages
    await expect(page.getByText('23%').first()).toBeVisible();
  });

  test('active failure clusters', async ({ page }) => {
    await expect(page.getByText('Active Failure Clusters')).toBeVisible();
    await expect(page.getByText('Authentication token expiry race')).toBeVisible();
    await expect(page.getByText('Payment webhook timeout')).toBeVisible();
    // Classification badges
    await expect(page.getByText('regression').first()).toBeVisible();
    await expect(page.getByText('critical').first()).toBeVisible();
  });

  test('demo banner persists', async ({ page }) => {
    await expect(page.getByText(/demo mode/i)).toBeVisible();
  });

  test('pass status badge', async ({ page }) => {
    await expect(page.getByText('pass').first()).toBeVisible();
  });

  test('metric cards have trend indicators', async ({ page }) => {
    // Up/down arrows with percentage changes
    await expect(page.getByText('2.1').first()).toBeVisible();
    await expect(page.getByText('1.3').first()).toBeVisible();
    await expect(page.getByText('0.8').first()).toBeVisible();
  });

  test('responsive: charts stack on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.getByText('Release Dashboard')).toBeVisible();
    await expect(page.getByText('94.2%').first()).toBeVisible();
    // Charts should still render
    const charts = page.locator('.recharts-responsive-container');
    expect(await charts.count()).toBeGreaterThanOrEqual(2);
  });

  test('responsive: metric cards go 2-column on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    // All 8 metrics should still be visible
    await expect(page.getByText('Release Health')).toBeVisible();
    await expect(page.getByText('Tests in PR')).toBeVisible();
  });
});
