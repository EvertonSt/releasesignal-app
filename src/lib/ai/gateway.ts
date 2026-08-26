import { z } from "zod";

// ── AI Gateway ─────────────────────────────────────────────────────────────
// Provider-agnostic AI interface with structured output, fallback, and mocking.

export type AIProvider = "openai" | "anthropic" | "ollama" | "mock";

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  schema?: z.ZodType;
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
}

export interface AIResponse<T = unknown> {
  data: T;
  provider: AIProvider;
  model: string;
  tokens: { input: number; output: number };
  latency: number;
  cached: boolean;
}

// ── Mock Provider ──────────────────────────────────────────────────────────

const MOCK_RESPONSES: Record<string, unknown> = {
  classify: {
    classification: "regression",
    confidence: 0.85,
    explanation: "This failure is likely a regression caused by a recent code change.",
    suggestedAction: "Review the last 5 commits touching the affected module.",
  },
  explain: {
    explanation: "The test failed because the expected value did not match the actual result. This suggests a behavioral change in the code under test.",
    rootCause: "Value mismatch after recent refactoring",
    confidence: 0.8,
  },
  summarize: {
    summary: "Release contains 3 new regressions and 2 flaky tests. Overall risk is medium. Recommend investigating the regressions before merging.",
    riskLevel: "medium",
    blockingIssues: 3,
  },
  remediate: {
    steps: [
      "Review the failing test and its assertions",
      "Check recent commits for breaking changes",
      "Run the test locally to reproduce",
      "Fix the root cause or update the test",
    ],
    estimatedEffort: "medium",
  },
};

function mockProvider<T>(schema?: z.ZodType): T {
  // Return a mock response based on available data
  const keys = Object.keys(MOCK_RESPONSES);
  const defaultKey = keys[0];
  const data = MOCK_RESPONSES[defaultKey];

  if (schema) {
    const result = schema.safeParse(data);
    if (result.success) return result.data as T;
  }

  return data as T;
}

// ── OpenAI Provider ────────────────────────────────────────────────────────

async function openaiProvider<T>(request: AIRequest, schema?: z.ZodType): Promise<T> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        ...(request.systemPrompt
          ? [{ role: "system", content: request.systemPrompt }]
          : []),
        { role: "user", content: request.prompt },
      ],
      temperature: request.temperature ?? 0.3,
      max_tokens: request.maxTokens ?? 1000,
      response_format: schema ? { type: "json_object" } : undefined,
    }),
    signal: AbortSignal.timeout(request.timeout ?? 10000),
  });

  if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
  const json = await response.json();
  const content = json.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");

  const parsed = JSON.parse(content);
  if (schema) {
    const result = schema.safeParse(parsed);
    if (!result.success) throw new Error(`Schema validation failed: ${result.error.message}`);
    return result.data as T;
  }

  return parsed as T;
}

// ── Anthropic Provider ─────────────────────────────────────────────────────

async function anthropicProvider<T>(request: AIRequest, schema?: z.ZodType): Promise<T> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: request.maxTokens ?? 1000,
      system: request.systemPrompt,
      messages: [{ role: "user", content: request.prompt }],
    }),
    signal: AbortSignal.timeout(request.timeout ?? 10000),
  });

  if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);
  const json = await response.json();
  const content = json.content[0]?.text;
  if (!content) throw new Error("Empty response from Anthropic");

  const parsed = JSON.parse(content);
  if (schema) {
    const result = schema.safeParse(parsed);
    if (!result.success) throw new Error(`Schema validation failed: ${result.error.message}`);
    return result.data as T;
  }

  return parsed as T;
}

// ── Gateway ────────────────────────────────────────────────────────────────

export async function analyze<T = unknown>(
  request: AIRequest,
  options: {
    provider?: AIProvider;
    schema?: z.ZodType;
    fallbackToMock?: boolean;
  } = {}
): Promise<AIResponse<T>> {
  const provider = options.provider ?? getActiveProvider();
  const start = Date.now();

  try {
    let data: T;

    switch (provider) {
      case "openai":
        data = await openaiProvider<T>(request, options.schema);
        break;
      case "anthropic":
        data = await anthropicProvider<T>(request, options.schema);
        break;
      case "mock":
      default:
        data = mockProvider<T>(options.schema);
        break;
    }

    return {
      data,
      provider,
      model: provider === "mock" ? "mock-v1" : provider,
      tokens: { input: 0, output: 0 },
      latency: Date.now() - start,
      cached: false,
    };
  } catch (error) {
    // Fallback to mock if configured
    if (options.fallbackToMock && provider !== "mock") {
      const data = mockProvider<T>(options.schema);
      return {
        data,
        provider: "mock",
        model: "mock-v1",
        tokens: { input: 0, output: 0 },
        latency: Date.now() - start,
        cached: false,
      };
    }
    throw error;
  }
}

function getActiveProvider(): AIProvider {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return "mock";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "mock";
}

// ── Prompt Templates ───────────────────────────────────────────────────────

export const PROMPTS = {
  classifyFailure: `You are a QA failure analyst. Classify this test failure.

Test: {testTitle}
Error: {errorMessage}
Stack: {stackTrace}
History: {historicalContext}

Return JSON: { classification, confidence, explanation, suggestedAction }`,

  explainFailure: `Explain why this test failure occurred and what it means for release quality.

Test: {testTitle}
Error: {errorMessage}
Context: {context}

Return JSON: { explanation, rootCause, confidence, relatedChanges }`,

  summarizeRelease: `Summarize the release risk based on these test results.

Total tests: {total}
Passed: {passed}
Failed: {failed}
Flaky: {flaky}
New regressions: {newRegressions}

Return JSON: { summary, riskLevel, blockingIssues, recommendations }`,

  suggestRemediation: `Suggest remediation steps for this failure.

Classification: {classification}
Error: {errorMessage}
Context: {context}

Return JSON: { steps, estimatedEffort, priority }`,
};
