import { afterEach, describe, expect, it, vi } from "vitest";

// ci-info's vendor table is not re-tested here; these probes only prove
// the wiring: detectCi reflects ci-info's env-based detection, which the
// old CI-variable check could not (e.g. TeamCity sets no CI variable).
const freshDetectCi = async (): Promise<() => boolean> => {
  vi.resetModules();
  const module = await import("../../debug/env/detectCi");
  return module.detectCi;
};

describe("detectCi", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should detect TeamCity via TEAMCITY_VERSION without the CI variable", async () => {
    vi.stubEnv("CI", undefined);
    vi.stubEnv("GITHUB_ACTIONS", undefined);
    vi.stubEnv("TEAMCITY_VERSION", "2025.07");

    const detectCi = await freshDetectCi();

    expect(detectCi()).toBe(true);
  });

  it("should stay false when no CI indicator is present", async () => {
    vi.stubEnv("CI", undefined);
    vi.stubEnv("GITHUB_ACTIONS", undefined);
    vi.stubEnv("TEAMCITY_VERSION", undefined);

    const detectCi = await freshDetectCi();

    expect(detectCi()).toBe(false);
  });
});
