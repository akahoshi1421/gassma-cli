import path from "path";
import { confirmDataLoss } from "./dataLossConfirmation";
import type { DataLossIo } from "./dataLossConfirmation";
import {
  STUB_FILE_NAME,
  prepareMigrationStub,
  writeMigrationStub,
} from "./generateMigrationStub";
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
  input?: NodeJS.ReadableStream;
  output?: NodeJS.WritableStream;
  isTty?: boolean;
};

const defaultDeps: MigrateDeps = { now: () => new Date() };

const resolveIo = (deps: MigrateDeps): DataLossIo => ({
  input: deps.input ?? process.stdin,
  output: deps.output ?? process.stdout,
  isTty:
    deps.isTty ??
    (process.stdin.isTTY === true && process.stdout.isTTY === true),
});

const recordMigration = (
  migrationsDir: string,
  content: string,
  name: string | undefined,
  deps: MigrateDeps,
): boolean => {
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

async function migrate(
  options?: MigrateOptions,
  deps: MigrateDeps = defaultDeps,
): Promise<void> {
  const prepared = prepareMigrationStub(options);
  const migrationsDir = path.join(prepared.baseDir, "migrations");
  const approved = await confirmDataLoss(
    {
      acceptDataLoss: prepared.acceptDataLoss,
      previousTrail: findLatestMigrationContent(migrationsDir),
      sheetNames: prepared.sheetNames,
    },
    resolveIo(deps),
  );

  if (!approved) {
    console.log(
      `Aborted. ${STUB_FILE_NAME} and the migration were not written.`,
    );
    return;
  }

  const stubPath = writeMigrationStub(prepared.outputDir, prepared.content);
  const recorded = recordMigration(
    migrationsDir,
    prepared.content,
    options?.name,
    deps,
  );
  printNextSteps(stubPath, buildHeadline(recorded), prepared.acceptDataLoss);
}

export { migrate };
export type { MigrateDeps, MigrateOptions };
