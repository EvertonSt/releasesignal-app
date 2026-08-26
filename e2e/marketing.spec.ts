import { test, expect } from './fixtures';

test.describe('Marketing Site', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero section with headline and dual CTAs', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('ReleaseSignal');
    await expect(page.getByText('Turn every test run into a release decision')).toBeVisible();
    await expect(page.getByText('AI QA intelligence for confident releases')).toBeVisible();
    // Two CTA buttons
    const ctas = page.getByRole('link', { name: /explore|demo|walkthrough|book/i });
    expect(await ctas.count()).toBeGreaterThanOrEqual(2);
  });

  test('problem section explains 6 pain points', async ({ page }) => {
    const painPoints = [
      /failed test does not always mean/i,
      /flaky tests waste/i,
      /environment failures create/i,
      /performance degradation/i,
      /ci output is often/i,
      /release decisions are frequently/i,
    ];
    for (const pattern of painPoints) {
      await expect(page.getByText(pattern).first()).toBeVisible();
    }
  });

  test('capabilities section shows all 11 features', async ({ page }) => {
    const features = [
      'Release health scoring',
      'Failure classification',
      'Flaky-test detection',
      'Regression detection',
      'Performance trend analysis',
      'Pull-request quality reports',
      'Test-run history',
      'Quality gates',
      'Human triage',
      'Audit history',
      'Team ownership',
    ];
    for (const feature of features) {
      await expect(page.getByText(feature).first()).toBeVisible();
    }
  });

  test('technical credibility section', async ({ page }) => {
    await expect(page.getByText('GitHub App integration')).toBeVisible();
    await expect(page.getByText('TypeScript-first architecture')).toBeVisible();
    await expect(page.getByText('OpenTelemetry-ready')).toBeVisible();
    await expect(page.getByText('Role-based access control')).toBeVisible();
  });

  test('pricing section shows $10,000 custom deployment', async ({ page }) => {
    await expect(page.getByText('US$10,000')).toBeVisible();
    await expect(page.getByText(/custom deployment/i).first()).toBeVisible();
    await expect(page.getByText('Core quality intelligence platform')).toBeVisible();
    await expect(page.getByText('GitHub and CI integration')).toBeVisible();
    await expect(page.getByText('Team onboarding')).toBeVisible();
  });

  test('builder section with Everton bio', async ({ page }) => {
    await expect(page.getByText(/Everton S. Andrade/)).toBeVisible();
    await expect(page.getByText(/QA Automation Engineer/)).toBeVisible();
    await expect(page.getByText(/Brazil-based/)).toBeVisible();
  });

  test('demo banner is visible on marketing site', async ({ page }) => {
    await expect(page.getByText(/demo mode/i)).toBeVisible();
  });

  test('CTA navigates to dashboard', async ({ page }) => {
    await page.getByRole('link', { name: /explore.*demo/i }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.getByText('Release Dashboard')).toBeVisible();
  });

  test('responsive: hero stacks on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.getByText('Turn every test run into a release decision')).toBeVisible();
    await expect(page.getByRole('link', { name: /explore.*demo/i })).toBeVisible();
  });

  test('responsive: capabilities grid on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText('Release health scoring')).toBeVisible();
  });
});
