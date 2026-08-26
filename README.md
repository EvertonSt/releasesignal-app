# ReleaseSignal

> Turn every test run into a clear release decision.

ReleaseSignal is an AI-assisted QA intelligence and release-risk platform for software teams. It connects to your CI pipeline, ingests test results, classifies failures, detects regressions, and produces explainable quality gates for confident releases.

![Demo mode banner](https://img.shields.io/badge/demo_mode-synthetic_data-yellow)

## Features

- **Test Result Ingestion** — Receive JUnit XML, Playwright JSON, or generic JSON via API or GitHub Actions
- **Failure Classification** — 14 deterministic rules classify failures as regression, flaky, environment, or test defect
- **Quality Gate Engine** — 8 configurable rule types with pass/warning/blocked decisions
- **Flaky Test Detection** — Track flake rates, quarantine proposals, and remediation suggestions
- **Release Dashboard** — Executive view with health score, pass/fail rates, and trends
- **Pull Request Reports** — Quality gate decisions published to GitHub Checks
- **Performance Regression** — p50/p95 tracking with budget enforcement
- **AI Analysis** — Provider-agnostic AI gateway for failure explanation (works with OpenAI, Anthropic, or mock)
- **Multi-tenant** — Organization-scoped data with role-based access control
- **Demo Mode** — Full synthetic dataset for exploration without connecting real services

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Radix |
| Database | PostgreSQL 16 + Prisma 6 |
| Cache/Jobs | Redis 7 |
| Charts | Recharts |
| Auth | NextAuth (GitHub OAuth) |
| Unit Tests | Vitest |
| E2E Tests | Playwright |
| Containerization | Docker Compose |

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose (for database)

### Development



Open [http://localhost:3000](http://localhost:3000) to see the marketing site.
Navigate to the dashboard to explore the full application in demo mode.

## Project Structure



## Architecture

### Ingestion Pipeline



### Failure Classification Engine

The classifier uses 14 deterministic rules with regex pattern matching:

| Pattern | Classification | Confidence |
|---------|---------------|------------|
| timeout, ETIMEDOUT, ECONNREFUSED | environment | 0.85 |
| 429, rate limit | environment | 0.90 |
| heap out of memory | environment | 0.95 |
| TypeError, ReferenceError | regression | 0.90 |
| AssertionError, expect() | regression | 0.85 |
| snapshot mismatch | flaky | 0.85 |
| race condition | flaky | 0.70 |
| selector not found | test_defect | 0.70 |
| No match | unknown | 0.30 |

Confidence is adjusted by retry history and historical frequency.
AI analysis supplements but never replaces deterministic classification.

### Quality Gate Rules

| Rule Type | What it checks |
|-----------|---------------|
| pass_rate | Minimum pass percentage |
| failure_rate | Maximum failure percentage |
| flaky_rate | Maximum flaky test percentage |
| new_regressions | Maximum new regressions |
| new_failures | Maximum new failures |
| performance_budget | p95 duration limit |
| test_coverage | Minimum coverage percentage |
| required_suites | Required test suites must run |

## API Reference

### Ingest Test Results



### Classify Failures



### Evaluate Quality Gate



### Query Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/health | GET | Health check |
| /api/runs | GET | Paginated test runs |
| /api/failures | GET | Failure clusters |
| /api/gates | GET | Quality gates |
| /api/reports | GET | Reports list |

## Testing

### Unit Tests (59 tests)



Test suites:
-  — 29 tests: signature generation, classification rules, severity assignment, action suggestions
-  — 17 tests: gate evaluation, rule types, pass rate, flaky rate computation
-  — 13 tests: token redaction, password patterns, connection strings

### E2E Tests (129 tests)



## Docker

### Development



### Production Build



## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://... |
| REDIS_URL | Redis connection string | redis://localhost:6379 |
| NEXT_PUBLIC_DEMO_MODE | Enable demo mode with synthetic data | true |
| NEXTAUTH_SECRET | NextAuth session secret | (required for auth) |
| GITHUB_CLIENT_ID | GitHub OAuth client ID | (optional) |
| GITHUB_CLIENT_SECRET | GitHub OAuth client secret | (optional) |
| AI_PROVIDER | AI provider (openai/anthropic/mock) | mock |
| AI_API_KEY | API key for AI provider | (optional) |

## Demo Mode

When , the application uses pre-built synthetic data including:

- 3 repositories (acme-web, acme-api, acme-mobile)
- 12+ test runs across branches and environments
- 7 failure clusters with classifications
- 10 flaky tests with quarantine proposals
- 3 quality gates with rules
- Performance metrics and trends

All data is clearly labeled as synthetic. No real customer data is used.


## Database Setup

```bash
# Push schema
npx prisma db push

# Seed demo data
pnpm db:seed

# Open Prisma Studio
pnpm db:studio
```

## Security

### Authentication

- **GitHub OAuth** via NextAuth for user authentication
- **Secure sessions** with HTTP-only cookies and configurable expiry
- **Demo mode** bypasses authentication for exploring synthetic data

### Authorization & Tenant Isolation

- **Organization-scoped data** - every record includes `organizationId`
- **RBAC** with four roles: Owner, Admin, Member, Viewer
- **Cross-tenant isolation** - API routes enforce org filtering on every query

### Secret Management

- **Environment variables** for all secrets, never committed to git
- **`redactSecrets()`** strips GitHub tokens, API keys, passwords from logs and AI payloads
- **AI privacy** - secrets redacted before any AI call; source code never transmitted

### API Security

- **Rate limiting** via token bucket on all endpoints
- **Zod validation** on every inbound payload
- **Idempotency** via `idempotencyKey` to prevent duplicate processing
- **Webhook HMAC-SHA256** signature verification for GitHub
- **Security headers** - CSP, X-Frame-Options: DENY, HSTS

### Data Protection

- **Audit logging** - every mutation creates an `AuditEvent`
- **Configurable data retention** per organization
- **Safe error messages** - no stack traces or internal paths exposed

## Threat Model

### Risk 1: Unauthorized Organization Access

**Threat:** User A accesses User B organization data. **Mitigation:** Every query filters by `organizationId`. Membership enforces roles. Tenant-isolation tested.

### Risk 2: Compromised GitHub Integration

**Threat:** Stolen credentials read private repos. **Mitigation:** Least-privilege permissions. Encrypted tokens. HMAC-SHA256 webhook verification.

### Risk 3: Malicious Webhook Payloads

**Threat:** Crafted payloads for injection. **Mitigation:** Zod validation. Idempotency. Rate limiting. No `eval()` on payloads.

### Risk 4: Prompt Injection via AI

**Threat:** Test names manipulate AI classification. **Mitigation:** Deterministic rules always run first. AI output schema-validated. Human override available.

### Risk 5: Sensitive Data to AI Providers

**Threat:** Tokens or PII sent to OpenAI/Anthropic. **Mitigation:** `redactSecrets()` before any AI call. AI can be disabled. Only error messages sent.

### Risk 6: Denial of Service

**Threat:** Flood ingestion endpoint. **Mitigation:** Rate limiting. Payload size limits. Idempotency. Background job queue.

### Risk 7: Database Injection

**Threat:** SQL injection via filters. **Mitigation:** Prisma ORM parameterizes all queries. No raw SQL on user input. Zod validation.

### Risk 8: Session Hijacking

**Threat:** Stolen session cookie. **Mitigation:** HTTP-only cookies. SameSite=Strict. Secure flag. Session invalidation on logout.

## Deployment Guide

### Architecture Overview

```
Load Balancer (HTTPS)
    |
    +-- Next.js App (Web + API) :3000
    +-- Redis (Cache/Jobs) :6379
    +-- Background Worker (Classification) :3001
    |
    +-- PostgreSQL 16 (Primary) :5432
    +-- S3-Compatible Storage (Files)
```

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16+
- Redis 7+
- S3-compatible storage (AWS S3, MinIO, Cloudflare R2)
- Docker & Docker Compose (recommended)

### Option 1: Docker Compose (Recommended)

```bash
git clone <repo-url> releasesignal-app
cd releasesignal-app
cp .env.local.example .env.local
docker compose up --build -d
docker compose exec app pnpm db:seed
docker compose logs -f app
```

### Option 2: Manual Setup

```bash
pnpm install
docker compose up -d postgres redis
cp .env.local.example .env.local
npx prisma generate
npx prisma db push
pnpm db:seed
pnpm dev
```

### Option 3: Vercel

```bash
vercel deploy
```

**Note:** Vercel serverless does not support background workers.

### GitHub App Setup

1. Go to GitHub Settings > Developer settings > GitHub Apps > New GitHub App
2. Set Webhook URL to your /api/webhooks/github endpoint
3. Set Webhook secret to a random string
4. Request permissions: Contents (read), Checks (read/write), Pull requests (read)
5. Subscribe to events: Check run, Check suite, Pull request, Push
6. Install on your organization
7. Copy App ID and Private Key to environment variables

### CI Upload Setup

Add this step to your GitHub Actions workflow after the test step:

```yaml
- name: Upload to ReleaseSignal
  if: always()
  run:
    curl -X POST your-domain.com/api/ingress
      -H "Content-Type: application/json"
      -d "{"repository": "${{ github.repository }}", "branch": "${{ github.ref_name }}", "commit": "${{ github.sha }}", "suites": [{"name": "e2e", "tests": $(cat results.json)}], "idempotencyKey": "${{ github.run_id }}"}"
```

### Production Checklist

- [ ] Set NEXT_PUBLIC_DEMO_MODE=false
- [ ] Configure NEXTAUTH_SECRET with a strong random value
- [ ] Set up PostgreSQL with SSL enabled
- [ ] Set up Redis with authentication
- [ ] Configure S3-compatible storage
- [ ] Set up GitHub App with minimal permissions
- [ ] Enable rate limiting
- [ ] Set up SSL/TLS termination
- [ ] Configure CORS for your domain
- [ ] Set up database backups (daily)
- [ ] Configure log aggregation (OpenTelemetry)
- [ ] Set up health check monitoring
- [ ] Review quality gate rules
- [ ] Run pnpm audit and fix vulnerabilities

### Backup Strategy

```bash
pg_dump -U releasesignal releasesignal | gzip > backup_$(date +%Y%m%d).sql.gz
gunzip -c backup.sql.gz | psql -U releasesignal releasesignal
```

### Scaling

| Component | Strategy |
|-----------|----------|
| Next.js App | Horizontal scaling behind load balancer |
| PostgreSQL | Read replicas for heavy dashboard queries |
| Redis | Cluster mode for high-throughput caching |
| Background Worker | Multiple workers with job queue partitioning |
| S3 Storage | Auto-scales with provider |

## License

Proprietary — Custom implementation available.

---

Built by [Everton S. Andrade](https://github.com/EvertonSt) — QA Automation Engineer and AI tooling developer.

