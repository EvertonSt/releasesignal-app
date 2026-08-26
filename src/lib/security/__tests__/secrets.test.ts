import { describe, it, expect } from "vitest";
import { redactSecrets, containsSecrets } from "../secrets";

describe("redactSecrets", () => {
  it("redacts GitHub personal access tokens", () => {
    const input = "Token: ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij";
    const result = redactSecrets(input);
    expect(result).not.toContain("ghp_");
    expect(result).toContain("[REDACTED]");
  });

  it("redacts GitHub OAuth tokens", () => {
    const input = "Token: gho_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij";
    const result = redactSecrets(input);
    expect(result).not.toContain("gho_");
  });

  it("redacts OpenAI API keys (48 chars after sk-)", () => {
    const input = "key=sk-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    const result = redactSecrets(input);
    expect(result).not.toContain("sk-");
    expect(result).toContain("[REDACTED]");
  });

  it("redacts password patterns", () => {
    const input = "password=supersecret123";
    const result = redactSecrets(input);
    expect(result).not.toContain("supersecret123");
  });

  it("redacts token patterns", () => {
    const input = "token: abc123def456ghi789";
    const result = redactSecrets(input);
    expect(result).toContain("[REDACTED]");
  });

  it("redacts AWS access keys", () => {
    const input = "AWS key: AKIAIOSFODNN7EXAMPLE";
    const result = redactSecrets(input);
    expect(result).not.toContain("AKIAIOSFODNN7");
  });

  it("redacts MongoDB connection strings", () => {
    const input = "DB=mongodb+srv://user:pass@cluster.example.com/db";
    const result = redactSecrets(input);
    expect(result).not.toContain("pass@cluster");
  });

  it("preserves non-secret content", () => {
    const input = "Test run completed successfully with 42 tests";
    const result = redactSecrets(input);
    expect(result).toBe(input);
  });

  it("handles empty string", () => {
    expect(redactSecrets("")).toBe("");
  });

  it("redacts multiple secrets in one string", () => {
    const input = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij and gho_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij";
    const result = redactSecrets(input);
    const redactedCount = (result.match(/\[REDACTED\]/g) || []).length;
    expect(redactedCount).toBe(2);
  });
});

describe("containsSecrets", () => {
  it("detects GitHub tokens", () => {
    expect(containsSecrets("ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij")).toBe(true);
  });

  it("detects password patterns", () => {
    expect(containsSecrets("password=mysecret")).toBe(true);
  });

  it("returns false for clean text", () => {
    expect(containsSecrets("No secrets here")).toBe(false);
  });
});
