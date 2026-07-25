import { describe, expect, it } from "vitest";
import { resolveTimeZone } from "../../../bootstrap/generators/resolveTimeZone";

describe("resolveTimeZone", () => {
  it("should return a valid IANA candidate as is", () => {
    expect(resolveTimeZone("Asia/Tokyo")).toBe("Asia/Tokyo");
    expect(resolveTimeZone("Europe/Paris")).toBe("Europe/Paris");
  });

  it("should fall back for an invalid time zone", () => {
    expect(resolveTimeZone("Invalid/Zone")).toBe("America/New_York");
  });

  it("should fall back for an empty string", () => {
    expect(resolveTimeZone("")).toBe("America/New_York");
  });

  it("should detect a valid system time zone when no candidate is given", () => {
    const detected = resolveTimeZone();

    expect(detected.length).toBeGreaterThan(0);
    expect(
      () => new Intl.DateTimeFormat("en", { timeZone: detected }),
    ).not.toThrow();
  });
});
