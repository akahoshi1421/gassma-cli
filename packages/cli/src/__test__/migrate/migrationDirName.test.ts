import { describe, expect, it } from "vitest";
import { buildMigrationDirName } from "../../migrate/migrationDirName";

describe("buildMigrationDirName", () => {
  it("should format the date as UTC yyyymmddhhmmss", () => {
    const date = new Date(Date.UTC(2026, 6, 29, 4, 5, 6));
    expect(buildMigrationDirName(date)).toBe("20260729040506");
  });

  it("should zero-pad every component", () => {
    const date = new Date(Date.UTC(2026, 0, 2, 3, 4, 5));
    expect(buildMigrationDirName(date)).toBe("20260102030405");
  });

  it("should use UTC regardless of the local timezone offset", () => {
    const date = new Date("2026-07-29T09:00:00+09:00");
    expect(buildMigrationDirName(date)).toBe("20260729000000");
  });

  it("should append the name with an underscore", () => {
    const date = new Date(Date.UTC(2026, 6, 29, 4, 5, 6));
    expect(buildMigrationDirName(date, "add-user")).toBe(
      "20260729040506_add-user",
    );
  });

  it("should not add a trailing underscore without a name", () => {
    const date = new Date(Date.UTC(2026, 6, 29, 4, 5, 6));
    expect(buildMigrationDirName(date).endsWith("_")).toBe(false);
  });

  it("should treat an empty name as omitted", () => {
    const date = new Date(Date.UTC(2026, 6, 29, 4, 5, 6));
    expect(buildMigrationDirName(date, "")).toBe("20260729040506");
  });
});
