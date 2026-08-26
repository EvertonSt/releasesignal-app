import { test, expect } from './fixtures';

test.describe('Authentication', () => {
  test('login page renders with heading', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Sign in to ReleaseSignal')).toBeVisible();
  });

  test('login has GitHub OAuth button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in with github/i })).toBeVisible();
  });

  test('login has demo mode fallback', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/continue in demo mode/i)).toBeVisible();
  });

  test('login has RS logo', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('RS').first()).toBeVisible();
  });

  test('login has security badges', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/OAuth 2\.0/i).first().or(page.getByText(/encrypted/i).first())).toBeVisible();
  });

  test('demo mode: all app pages accessible without auth', async ({ page }) => {
    const routes = ['/dashboard', '/test-runs', '/failures', '/flaky-tests', '/quality-gates', '/pull-requests', '/performance', '/reports', '/settings'];
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('body')).not.toContainText(/sign in|unauthorized/i);
    }
  });

  test('demo mode: dashboard shows content', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Release Dashboard')).toBeVisible();
    await expect(page.getByText('Acme Engineering')).toBeVisible();
  });

  test('user menu shows in topbar', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Demo User')).toBeVisible();
  });

  test('demo banner persists on login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/demo mode/i)).toBeVisible();
  });
});
