import { describe, expect, it } from "vitest";
import { getOpenCommand } from "../../studio/getOpenCommand";

const URL = "https://docs.google.com/spreadsheets/d/abc123/edit";

describe("getOpenCommand", () => {
  it("should use open on darwin", () => {
    expect(getOpenCommand("darwin", URL)).toEqual({
      command: "open",
      args: [URL],
    });
  });

  it("should use cmd /c start on win32", () => {
    expect(getOpenCommand("win32", URL)).toEqual({
      command: "cmd",
      args: ["/c", "start", "", URL],
    });
  });

  it("should use xdg-open on linux", () => {
    expect(getOpenCommand("linux", URL)).toEqual({
      command: "xdg-open",
      args: [URL],
    });
  });

  it("should fall back to xdg-open on unknown platforms", () => {
    expect(getOpenCommand("freebsd", URL)).toEqual({
      command: "xdg-open",
      args: [URL],
    });
  });
});
