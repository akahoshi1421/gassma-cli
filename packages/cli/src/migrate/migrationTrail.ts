import fs from "fs";
import path from "path";

const MIGRATION_DIR_PATTERN = /^\d{14}(_.*)?$/;

const listMigrationDirNames = (migrationsDir: string): string[] => {
  if (!fs.existsSync(migrationsDir)) return [];

  return fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && MIGRATION_DIR_PATTERN.test(entry.name),
    )
    .map((entry) => entry.name)
    .sort();
};

const findLatestMigrationContent = (
  migrationsDir: string,
): string | undefined => {
  const dirNames = listMigrationDirNames(migrationsDir);
  if (dirNames.length === 0) return undefined;

  const latest = dirNames[dirNames.length - 1];
  const migrationPath = path.join(migrationsDir, latest, "migration.js");
  if (!fs.existsSync(migrationPath)) return undefined;

  return fs.readFileSync(migrationPath, "utf-8");
};

const writeMigrationTrail = (
  migrationsDir: string,
  dirName: string,
  content: string,
): string => {
  const trailDir = path.join(migrationsDir, dirName);
  fs.mkdirSync(trailDir, { recursive: true });

  const migrationPath = path.join(trailDir, "migration.js");
  fs.writeFileSync(migrationPath, content, "utf-8");
  return migrationPath;
};

export { findLatestMigrationContent, writeMigrationTrail };
