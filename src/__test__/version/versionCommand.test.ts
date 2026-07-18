import { afterEach, describe, expect, it, vi } from "vitest";
import { getVersion } from "../../version/getVersion";
import { versionCommand } from "../../version/versionCommand";

describe("versionCommand", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should print the plain version by default", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    versionCommand();
    expect(spy).toHaveBeenCalledWith(`gassma v${getVersion()}`);
  });

  it("should print JSON when json option is true", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    versionCommand({ json: true });
    expect(spy).toHaveBeenCalledWith(JSON.stringify({ gassma: getVersion() }));
  });
});
