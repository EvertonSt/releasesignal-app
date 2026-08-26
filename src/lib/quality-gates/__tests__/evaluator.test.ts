import { describe, it, expect } from "vitest";
import {
  evaluateGate,
  computePassRate,
  computeFlakyRate,
} from "../evaluator";
import type { QualityGateRule, EvaluationInput } from "../evaluator";

// ── Helpers ───────────────────────────────────────────────────────────────

function makeRule(overrides: Partial<QualityGateRule> = {}): QualityGateRule {
  return {
    id: "rule_1",
    gateId: "gate_1",
    type: "pass_rate",
    condition: "greater_than",
    threshold: 95,
    severity: "high",
    enabled: true,
    description: "Pass rate must be above 95%",
    ...overrides,
  };
}

function makeInput(overrides: Partial<EvaluationInput> = {}): EvaluationInput {
  return {
    totalTests: 200,
    failedTests: 5,
    passedTests: 190,
    flakyTests: 3,
    newRegressions: 1,
    newFailures: 2,
    p95Duration: 45,
    branch: "main",
    environment: "ci",
    ...overrides,
  };
}

// ── evaluateGate ──────────────────────────────────────────────────────────

describe("evaluateGate", () => {
  it("returns pass when all rules pass", () => {
    const rules = [makeRule({ type: "pass_rate", condition: "greater_than", threshold: 90 })];
    const result = evaluateGate(rules, makeInput());
    expect(result.decision).toBe("pass");
    expect(result.rules[0].passed).toBe(true);
  });

  it("returns warning when a high-severity rule fails", () => {
    const rules = [makeRule({ type: "pass_rate", condition: "greater_than", threshold: 99 })];
    const result = evaluateGate(rules, makeInput());
    expect(result.decision).toBe("warning");
    expect(result.rules[0].passed).toBe(false);
  });

  it("returns blocked when a critical-severity rule fails", () => {
    const rules = [
      makeRule({
        type: "new_regressions",
        condition: "equals",
        threshold: 0,
        severity: "critical",
        description: "No new regressions allowed",
      }),
    ];
    const result = evaluateGate(rules, makeInput({ newRegressions: 3 }));
    expect(result.decision).toBe("blocked");
  });

  it("skips disabled rules", () => {
    const rules = [
      makeRule({ enabled: false, severity: "critical" }),
      makeRule({ id: "rule_2", type: "pass_rate", threshold: 50 }),
    ];
    const result = evaluateGate(rules, makeInput());
    expect(result.rules.length).toBe(1);
    expect(result.rules[0].ruleId).toBe("rule_2");
  });

  it("evaluates failure_rate correctly", () => {
    const rules = [makeRule({ type: "failure_rate", condition: "less_than", threshold: 5 })];
    const result = evaluateGate(rules, makeInput());
    expect(result.rules[0].actualValue).toBe(2.5);
    expect(result.rules[0].passed).toBe(true);
  });

  it("evaluates flaky_rate correctly", () => {
    const rules = [makeRule({ type: "flaky_rate", condition: "less_than", threshold: 2 })];
    const result = evaluateGate(rules, makeInput());
    expect(result.rules[0].actualValue).toBe(1.5);
    expect(result.rules[0].passed).toBe(true);
  });

  it("evaluates performance_budget correctly", () => {
    const rules = [makeRule({ type: "performance_budget", condition: "less_than", threshold: 60 })];
    const result = evaluateGate(rules, makeInput());
    expect(result.rules[0].actualValue).toBe(45);
    expect(result.rules[0].passed).toBe(true);
  });

  it("evaluates new_failures correctly", () => {
    const rules = [makeRule({ type: "new_failures", condition: "equals", threshold: 0 })];
    const result = evaluateGate(rules, makeInput({ newFailures: 0 }));
    expect(result.rules[0].passed).toBe(true);
  });

  it("evaluates test_coverage correctly", () => {
    const rules = [makeRule({ type: "test_coverage", condition: "greater_than", threshold: 80 })];
    const result = evaluateGate(rules, makeInput({ testCoverage: 85.5 }));
    expect(result.rules[0].actualValue).toBe(85.5);
    expect(result.rules[0].passed).toBe(true);
  });

  it("returns summary with rule counts", () => {
    const rules = [makeRule(), makeRule({ id: "rule_2", threshold: 50 })];
    const result = evaluateGate(rules, makeInput());
    expect(result.summary).toMatch(/\d+\/\d+ rules passed/);
  });

  it("returns evaluatedAt timestamp", () => {
    const result = evaluateGate([makeRule()], makeInput());
    expect(result.evaluatedAt).toBeInstanceOf(Date);
  });
});

// ── computePassRate ───────────────────────────────────────────────────────

describe("computePassRate", () => {
  it("calculates pass rate correctly", () => {
    const rate = computePassRate(makeInput({ totalTests: 200, passedTests: 190 }));
    expect(rate).toBe(95);
  });

  it("returns 0 for empty test runs", () => {
    expect(computePassRate(makeInput({ totalTests: 0, passedTests: 0 }))).toBe(0);
  });

  it("rounds to 2 decimal places", () => {
    const rate = computePassRate(makeInput({ totalTests: 3, passedTests: 2 }));
    expect(rate).toBe(66.67);
  });
});

// ── computeFlakyRate ──────────────────────────────────────────────────────

describe("computeFlakyRate", () => {
  it("calculates flaky rate correctly", () => {
    const rate = computeFlakyRate(makeInput({ totalTests: 200, flakyTests: 10 }));
    expect(rate).toBe(5);
  });

  it("returns 0 for empty test runs", () => {
    expect(computeFlakyRate(makeInput({ totalTests: 0, flakyTests: 0 }))).toBe(0);
  });

  it("rounds to 2 decimal places", () => {
    const rate = computeFlakyRate(makeInput({ totalTests: 3, flakyTests: 1 }));
    expect(rate).toBe(33.33);
  });
});
