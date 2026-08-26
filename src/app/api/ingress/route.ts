import { NextRequest, NextResponse } from "next/server";
import { validatePayload } from "@/lib/ingress/validator";
import { processPayload, isDuplicate, getRun, getAllRuns, getRunCount } from "@/lib/ingress/processor";

/**
 * POST /api/ingress — Ingest test results from a CI pipeline.
 *
 * Headers:
 *   Content-Type: application/json
 *   Authorization: Bearer <api-key> (required in production)
 *
 * Body: IngestPayload (see src/lib/ingress/validator.ts)
 *
 * Response:
 *   201 — Successfully ingested
 *   400 — Validation error
 *   409 — Duplicate (idempotency key already used)
 *   401 — Missing or invalid API key (production only)
 */
export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

  try {
    // Parse body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON payload",
          requestId,
        },
        { status: 400 },
      );
    }

    // Validate payload
    const result = validatePayload(body);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: result.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
          requestId,
        },
        { status: 400 },
      );
    }

    const payload = result.data;

    // Check idempotency
    if (payload.idempotencyKey && isDuplicate(payload.idempotencyKey)) {
      return NextResponse.json(
        {
          success: false,
          error: "Duplicate request",
          message: "This idempotency key has already been processed",
          requestId,
        },
        { status: 409 },
      );
    }

    // Process the payload
    const run = await processPayload(payload);

    // Count total tests
    const totalTests = run.stats.total;
    const failedTests = run.stats.failed;

    return NextResponse.json(
      {
        success: true,
        data: {
          runId: run.id,
          status: run.status,
          gateDecision: run.gateDecision,
          stats: run.stats,
          repository: payload.repository,
          branch: payload.branch,
          commit: payload.commit,
          duration: run.duration,
          message:
            run.gateDecision === "pass"
              ? `All ${totalTests} tests passed`
              : run.gateDecision === "blocked"
                ? `${failedTests} of ${totalTests} tests failed — gate blocked`
                : `${totalTests} tests processed with warnings`,
        },
        requestId,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        requestId,
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/ingress — List all ingested runs or get a specific run.
 *
 * Query params:
 *   ?runId=<id> — Get a specific run
 *   ?limit=<n> — Limit results (default 20)
 */
export async function GET(request: NextRequest) {
  const requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const { searchParams } = new URL(request.url);

  const runId = searchParams.get("runId");

  // Get specific run
  if (runId) {
    const run = getRun(runId);
    if (!run) {
      return NextResponse.json(
        { success: false, error: "Run not found", requestId },
        { status: 404 },
      );
    }
    return NextResponse.json({
      success: true,
      data: {
        id: run.id,
        status: run.status,
        gateDecision: run.gateDecision,
        stats: run.stats,
        repository: run.payload.repository,
        branch: run.payload.branch,
        commit: run.payload.commit,
        duration: run.duration,
        receivedAt: run.receivedAt,
        processedAt: run.processedAt,
      },
      requestId,
    });
  }

  // List all runs
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const allRuns = getAllRuns().slice(0, limit);

  return NextResponse.json({
    success: true,
    data: {
      runs: allRuns.map((run) => ({
        id: run.id,
        status: run.status,
        gateDecision: run.gateDecision,
        stats: run.stats,
        repository: run.payload.repository,
        branch: run.payload.branch,
        commit: run.payload.commit,
        duration: run.duration,
        receivedAt: run.receivedAt,
      })),
      total: getRunCount(),
      showing: allRuns.length,
    },
    requestId,
  });
}
