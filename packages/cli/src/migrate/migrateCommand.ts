import path from "path";
import { STUB_FILE_NAME, generateMigrationStub } from "./generateMigrationStub";
import { buildMigrationDirName } from "./migrationDirName";
import {
  findLatestMigrationContent,
  writeMigrationTrail,
} from "./migrationTrail";
import { printNextSteps } from "./printNextSteps";

type MigrateOptions = {
  name?: string;
  output?: string;
  schema?: string;
  config?: string;
  acceptDataLoss?: boolean;
};

type MigrateDeps = {
  now: () => Date;
};

const defaultDeps: MigrateDeps = { now: () => new Date() };

const recordMigration = (
  baseDir: string,
  content: string,
  name: string | undefined,
  deps: MigrateDeps,
): boolean => {
  const migrationsDir = path.join(baseDir, "migrations");
  if (findLatestMigrationContent(migrationsDir) === content) {
    console.log(
      "Already in sync, no schema change or pending migration was found.",
    );
    return false;
  }

  const dirName = buildMigrationDirName(deps.now(), name);
  const trailPath = writeMigrationTrail(migrationsDir, dirName, content);
  console.log(`📄 Created ${trailPath}`);
  return true;
};

const buildHeadline = (recorded: boolean): string =>
  recorded
    ? "✅ Migration generated"
    : `✅ Refreshed ${STUB_FILE_NAME} (no new migration recorded)`;

function migrate(options?: MigrateOptions, deps: MigrateDeps = defaultDeps) {
  const stub = generateMigrationStub(options);
  const recorded = recordMigration(
    stub.baseDir,
    stub.content,
    options?.name,
    deps,
  );
  printNextSteps(stub.stubPath, buildHeadline(recorded), stub.acceptDataLoss);
}

export { migrate };
export type { MigrateDeps, MigrateOptions };
