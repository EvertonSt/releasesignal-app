import type { TestRun } from '@/types';
import { demoRepos } from './organizations';
const now = new Date();
const dAgo = (n: number) => new Date(now.getTime() - n * 86400000);
export function generateTestRuns(): TestRun[] {
  const runs: TestRun[] = [];
  const branches = ['main','main','main','feat/auth-v2','fix/dashboard-leak','chore/deps-update','feat/perf-optimization'];
  const statuses: Array<'passed'|'failed'|'running'|'queued'|'cancelled'> = ['passed','passed','passed','passed','passed','failed','passed','passed','passed','failed'];
  const triggers = ['push','pull_request','schedule','workflow_dispatch'];
  const actors = ['Everton Andrade','Sarah Chen','Marcus Johnson','Priya Patel'];
  for (let i = 0; i < 60; i++) {
    const dayOffset = Math.floor(i / 2);
    const repo = demoRepos[i % 4];
    const branch = branches[i % branches.length];
    const status = statuses[i % statuses.length];
    const totalTests = 180 + Math.floor(Math.sin(i * 0.5) * 40);
    const failedCount = status === 'failed' ? 2 + (i % 5) : (i % 7 === 0 ? 1 : 0);
    const flakyCount = i % 4 === 0 ? 1 + (i % 3) : 0;
    const passedCount = totalTests - failedCount - flakyCount - Math.floor(Math.abs(Math.sin(i * 0.7) * 3));
    const skipped = Math.max(0, totalTests - passedCount - failedCount - flakyCount);
    const duration = 45000 + Math.floor(Math.sin(i * 0.3) * 15000) + i * 100;
    const gateDecision = failedCount > 3 ? 'blocked' : failedCount > 0 ? 'warning' : 'pass';
    runs.push({
      id: 'run_' + String(i + 1).padStart(3, '0'),
      organizationId: 'org_demo_001', repositoryId: repo.id, repository: repo, branch,
      commitSha: ((0xDEAD + i).toString(16) + (0xBEEF + i * 7).toString(16)).substring(0, 7),
      commitMessage: i % 3 === 0 ? 'feat: add new dashboard widget' : i % 3 === 1 ? 'fix: resolve auth token refresh' : 'chore: update dependencies',
      pullRequest: i % 5 === 0 ? { number: 100 + i, title: 'Add dashboard analytics', url: 'https://github.com/acme/acme-web/pull/' + (100 + i), author: actors[i % actors.length] } : undefined,
      environment: i % 5 === 0 ? 'staging' : 'ci', status,
      startedAt: dAgo(dayOffset), finishedAt: new Date(dAgo(dayOffset).getTime() + duration), duration, totalTests,
      passed: Math.max(0, passedCount), failed: failedCount, skipped, flaky: flakyCount,
      retried: flakyCount + (status === 'failed' ? 2 : 0),
      gateDecision: gateDecision as any,
      browser: i % 3 === 0 ? 'Chromium' : i % 3 === 1 ? 'Firefox' : 'WebKit',
      trigger: triggers[i % triggers.length], actor: actors[i % actors.length], failureClusters: [],
    });
  }
  return runs;
}
export const demoTestRuns = generateTestRuns();
