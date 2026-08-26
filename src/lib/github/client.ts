// ── GitHub API Client ──────────────────────────────────────────────────────
// Minimal GitHub API client for Checks and webhook management.
// Marked as "planned" when not configured.

export interface GitHubConfig {
  appId: string;
  privateKey: string;
  webhookSecret: string;
}

export interface CheckRun {
  id: number;
  name: string;
  status: "queued" | "in_progress" | "completed";
  conclusion?:
    | "success"
    | "failure"
    | "neutral"
    | "cancelled"
    | "timed_out"
    | "action_required";
  output?: {
    title: string;
    summary: string;
    text?: string;
  };
}

/** Check if GitHub integration is configured */
export function isGitHubConfigured(): boolean {
  return !!(
    process.env.GITHUB_APP_ID &&
    process.env.GITHUB_PRIVATE_KEY &&
    process.env.GITHUB_WEBHOOK_SECRET
  );
}

/** Get installation access token (placeholder) */
export async function getInstallationToken(
  _installationId: number
): Promise<string | null> {
  if (!isGitHubConfigured()) return null;
  // In production, use GitHub App JWT to get installation token
  // For now, return null to indicate "not implemented"
  return null;
}

/** Create or update a Check Run (placeholder) */
export async function createCheckRun(
  _params: {
    owner: string;
    repo: string;
    name: string;
    head_sha: string;
    status: "queued" | "in_progress" | "completed";
    conclusion?: string;
    output?: { title: string; summary: string; text?: string };
  },
  _token: string
): Promise<CheckRun | null> {
  if (!isGitHubConfigured()) return null;
  // In production, POST to GitHub API
  // For now, return null to indicate "not implemented"
  return null;
}

/** Mark GitHub integration as available or planned */
export function getIntegrationStatus(): {
  configured: boolean;
  message: string;
} {
  if (isGitHubConfigured()) {
    return { configured: true, message: "GitHub App integration is active" };
  }
  return {
    configured: false,
    message:
      "GitHub integration is planned. Configure GITHUB_APP_ID and GITHUB_PRIVATE_KEY to enable.",
  };
}
