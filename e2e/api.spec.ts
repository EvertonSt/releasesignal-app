import { test, expect } from './fixtures';

test.describe('API Endpoints', () => {

  test.describe('GET /api/health', () => {
    test('returns 200 with status ok', async ({ request }) => {
      const res = await request.get('/api/health');
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body).toHaveProperty('status');
      expect(body.status).toBe('ok');
    });

    test('includes timestamp', async ({ request }) => {
      const res = await request.get('/api/health');
      const body = await res.json();
      expect(body).toHaveProperty('timestamp');
    });

    test('includes version info', async ({ request }) => {
      const res = await request.get('/api/health');
      const body = await res.json();
      expect(body).toHaveProperty('version');
    });
  });

  test.describe('POST /api/ingress', () => {
    test('accepts valid test result payload', async ({ request }) => {
      const payload = {
        idempotencyKey: `test-${Date.now()}`,
        repository: 'acme-web',
        branch: 'main',
        commit: 'abc123def',
        workflow: 'ci.yml',
        suite: [
          {
            name: 'e2e',
            tests: [
              { title: 'test passes', status: 'passed', duration: 1200 },
              { title: 'test fails', status: 'failed', duration: 500, error: 'AssertionError' },
            ],
          },
        ],
      };
      const res = await request.post('/api/ingress', { data: payload });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('stats');
    });

    test('rejects duplicate idempotency key', async ({ request }) => {
      const key = `dup-test-${Date.now()}`;
      const payload = {
        idempotencyKey: key,
        repository: 'acme-web',
        branch: 'main',
        commit: 'abc123',
        workflow: 'ci.yml',
        suite: [{ name: 'unit', tests: [{ title: 't', status: 'passed', duration: 100 }] }],
      };
      const res1 = await request.post('/api/ingress', { data: payload });
      expect(res1.ok()).toBeTruthy();

      const res2 = await request.post('/api/ingress', { data: payload });
      expect(res2.status()).toBe(409);
    });

    test('rejects invalid payload (missing fields)', async ({ request }) => {
      const res = await request.post('/api/ingress', { data: {} });
      expect(res.status()).toBe(400);
    });

    test('GET /api/ingress lists stored runs', async ({ request }) => {
      const res = await request.get('/api/ingress');
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(Array.isArray(body)).toBeTruthy();
    });
  });

  test.describe('GET /api/v1/reports', () => {
    test('returns reports list', async ({ request }) => {
      const res = await request.get('/api/v1/reports');
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body).toHaveProperty('reports');
    });
  });
});
