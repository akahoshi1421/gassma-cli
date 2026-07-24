import { describe, expect, it } from "vitest";
import { buildSpreadsheetUrl } from "../../studio/buildSpreadsheetUrl";

describe("buildSpreadsheetUrl", () => {
  it("should return a full https URL as is", () => {
    const url = "https://docs.google.com/spreadsheets/d/abc123/edit";
    expect(buildSpreadsheetUrl(url)).toBe(url);
  });

  it("should return a full http URL as is", () => {
    const url = "http://docs.google.com/spreadsheets/d/abc123/edit";
    expect(buildSpreadsheetUrl(url)).toBe(url);
  });

  it("should keep query and fragment of a full URL", () => {
    const url = "https://docs.google.com/spreadsheets/d/abc123/edit#gid=42";
    expect(buildSpreadsheetUrl(url)).toBe(url);
  });

  it("should build a URL from a spreadsheet ID", () => {
    expect(buildSpreadsheetUrl("abc_DEF-123")).toBe(
      "https://docs.google.com/spreadsheets/d/abc_DEF-123/edit",
    );
  });
});
