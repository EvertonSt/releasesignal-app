import { NextRequest, NextResponse } from "next/server";
import {
  evaluateGate,
  type QualityGateRule,
  type EvaluationInput,
} from "@/lib/quality-gates/evaluator";
import { demoQualityGates } from "@/lib/demo/data/quality-gates";

/** POST /api/gates/evaluate — Evaluate a test run against quality gate rules */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      totalTests,
      failedTests,
      passedTests,
      flakyTests,
      newRegressions,
      newFailures,
      p95Duration,
      testCoverage,
      branch,
      environment,
      gateId,
    } = body;

    // Use provided gate or default to first gate
    const gate = gateId
      ? demoQualityGates.find((g) => g.id === gateId)
      : demoQualityGates[0];

    if (!gate) {
      return NextResponse.json(
        { error: "No quality gate found" },
        { status: 404 }
      );
    }

    // Convert demo rules to evaluator format
    const rules: QualityGateRule[] = gate.rules.map((r) => ({
      id: r.id,
      gateId: r.gateId,
      type: r.type as QualityGateRule["type"],
      condition: r.condition as QualityGateRule["condition"],
      threshold: r.threshold,
      severity: r.severity,
      enabled: r.enabled,
      description: r.description,
    }));

    const input: EvaluationInput = {
      totalTests: totalTests ?? 100,
      failedTests: failedTests ?? 0,
      passedTests: passedTests ?? 100,
      flakyTests: flakyTests ?? 0,
      newRegressions: newRegressions ?? 0,
      newFailures: newFailures ?? 0,
      p95Duration: p95Duration ?? 60,
      testCoverage,
      branch: branch ?? "main",
      environment: environment ?? "ci",
    };

    const result = evaluateGate(rules, input);

    return NextResponse.json({
      gateId: gate.id,
      gateName: gate.name,
      decision: result.decision,
      summary: result.summary,
      evaluatedAt: result.evaluatedAt,
      rules: result.rules,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Evaluation failed", details: String(error) },
      { status: 500 }
    );
  }
}
