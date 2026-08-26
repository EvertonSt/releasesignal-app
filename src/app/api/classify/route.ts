import { NextRequest, NextResponse } from "next/server";
import {
  classifyFailure,
  generateSignature,
  suggestAction,
  assignSeverity,
} from "@/lib/failure-analysis/classifier";

/** POST /api/classify — Classify a test failure */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { errorMessage, stackTrace, testTitle, retryResults, historicalFailures, isOnMain } =
      body;

    if (!testTitle) {
      return NextResponse.json(
        { error: "testTitle is required" },
        { status: 400 }
      );
    }

    // Generate signature
    const signature = generateSignature({
      errorMessage,
      stackTrace,
      testTitle,
    });

    // Classify
    const classification = classifyFailure({
      errorMessage,
      stackTrace,
      testTitle,
      retryResults,
      historicalFailures,
    });

    // Assign severity
    const severity = assignSeverity(classification.classification, {
      affectedRuns: historicalFailures,
      isOnMain,
    });

    // Suggest action
    const suggestedAction = suggestAction(classification.classification, {
      testName: testTitle,
      error: errorMessage,
    });

    return NextResponse.json({
      signature: signature.hash,
      classification: classification.classification,
      confidence: classification.confidence,
      severity,
      matchedRule: classification.matchedRule,
      evidence: classification.evidence,
      suggestedAction,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Classification failed", details: String(error) },
      { status: 500 }
    );
  }
}
