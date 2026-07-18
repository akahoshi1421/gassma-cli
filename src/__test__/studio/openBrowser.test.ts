import { afterEach, describe, expect, it, vi } from "vitest";
import { getOpenCommand } from "../../studio/getOpenCommand";

const spawnMock = vi.hoisted(() => vi.fn(() => ({ unref: vi.fn() })));

vi.mock("child_process", () => ({ spawn: spawnMock }));

import { openBrowser } from "../../studio/openBrowser";

const URL = "https://docs.google.com/spreadsheets/d/abc123/edit";

describe("openBrowser", () => {
  afterEach(() => {
    spawnMock.mockClear();
  });

  it("should spawn the platform open command detached with stdio ignored", () => {
    openBrowser(URL);

    const expected = getOpenCommand(process.platform, URL);
    expect(spawnMock).toHaveBeenCalledWith(expected.command, expected.args, {
      detached: true,
      stdio: "ignore",
    });
  });
});
