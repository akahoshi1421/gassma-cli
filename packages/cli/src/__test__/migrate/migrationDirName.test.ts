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
    expect(buildMigrationDirName(date, "add_user")).toBe(
      "20260729040506_add_user",
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

  describe("name sanitization", () => {
    const date = new Date(Date.UTC(2026, 6, 29, 4, 5, 6));

    it("should replace path separators like Prisma does", () => {
      expect(buildMigrationDirName(date, "evil/sub ★ mixed")).toBe(
        "20260729040506_evil_sub_mixed",
      );
    });

    it("should replace backslashes", () => {
      expect(buildMigrationDirName(date, "evil\\sub")).toBe(
        "20260729040506_evil_sub",
      );
    });

    it("should neutralize parent directory references", () => {
      expect(buildMigrationDirName(date, "../../../outside-trail")).toBe(
        "20260729040506_outside_trail",
      );
    });

    it("should lowercase and collapse spaces and symbols like Prisma does", () => {
      expect(buildMigrationDirName(date, "Add User ★Table--")).toBe(
        "20260729040506_add_user_table",
      );
    });

    it("should collapse hyphens into underscores", () => {
      expect(buildMigrationDirName(date, "add-user")).toBe(
        "20260729040506_add_user",
      );
    });

    it("should strip leading and trailing symbols", () => {
      expect(buildMigrationDirName(date, "--add--")).toBe("20260729040506_add");
    });

    it("should replace multibyte characters between words", () => {
      expect(buildMigrationDirName(date, "addユーザーtable")).toBe(
        "20260729040506_add_table",
      );
    });

    it("should treat a symbols-only name as omitted", () => {
      expect(buildMigrationDirName(date, "★--/")).toBe("20260729040506");
    });

    it("should treat a multibyte-only name as omitted", () => {
      expect(buildMigrationDirName(date, "日本語")).toBe("20260729040506");
    });

    it("should keep digits", () => {
      expect(buildMigrationDirName(date, "v2 Rollout")).toBe(
        "20260729040506_v2_rollout",
      );
    });
  });
});
