import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  findLatestMigrationContent,
  writeMigrationTrail,
} from "../../migrate/migrationTrail";

describe("migrationTrail", () => {
  let tmpDir: string;
  let migrationsDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gassma-migrate-trail-"));
    migrationsDir = path.join(tmpDir, "migrations");
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe("findLatestMigrationContent", () => {
    it("should return undefined when the migrations directory is missing", () => {
      expect(findLatestMigrationContent(migrationsDir)).toBeUndefined();
    });

    it("should return undefined when the migrations directory is empty", () => {
      fs.mkdirSync(migrationsDir, { recursive: true });
      expect(findLatestMigrationContent(migrationsDir)).toBeUndefined();
    });

    it("should read migration.js from the latest timestamp directory", () => {
      writeMigrationTrail(migrationsDir, "20260101000000", "old");
      writeMigrationTrail(migrationsDir, "20260729040506_add-user", "new");
      expect(findLatestMigrationContent(migrationsDir)).toBe("new");
    });

    it("should ignore directories that are not migrations", () => {
      writeMigrationTrail(migrationsDir, "20260101000000", "old");
      fs.mkdirSync(path.join(migrationsDir, "notes"), { recursive: true });
      fs.mkdirSync(path.join(migrationsDir, "99999999999999999"), {
        recursive: true,
      });
      expect(findLatestMigrationContent(migrationsDir)).toBe("old");
    });

    it("should ignore plain files in the migrations directory", () => {
      writeMigrationTrail(migrationsDir, "20260101000000", "old");
      fs.writeFileSync(path.join(migrationsDir, "99999999999999"), "file");
      expect(findLatestMigrationContent(migrationsDir)).toBe("old");
    });

    it("should return undefined when the latest directory lacks migration.js", () => {
      fs.mkdirSync(path.join(migrationsDir, "20260729040506"), {
        recursive: true,
      });
      expect(findLatestMigrationContent(migrationsDir)).toBeUndefined();
    });
  });

  describe("writeMigrationTrail", () => {
    it("should create the directory and write migration.js", () => {
      const written = writeMigrationTrail(
        migrationsDir,
        "20260729040506_add-user",
        "content",
      );
      expect(written).toBe(
        path.join(migrationsDir, "20260729040506_add-user", "migration.js"),
      );
      expect(fs.readFileSync(written, "utf-8")).toBe("content");
    });
  });
});
