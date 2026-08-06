import path from "path";
import { MigrateConfirmationRequiredError } from "../error/mainError";
import { decideDataLoss } from "./dataLossConfirmation";
import type { DataLossIo } from "./dataLossConfirmation";
import {
  STUB_FILE_NAME,
  prepareMigrationStub,
  writeMigrationStub,
} from "./generateMigrationStub";
import type { PreparedMigrationStub } from "./generateMigrationStub";
import { buildMigrationDirName } from "./migrationDirName";
import {
  findLatestMigrationContent,
  writeMigrationTrail,
} from "./migrationTrail";
import { printNextSteps } from "./printNextSteps";

type MigrateDevOptions = {
  name?: string;
  output?: string;
  schema?: string;
  config?: string;
};

type MigrateDevDeps = {
  now: () => Date;
  input?: NodeJS.ReadableStream;
  output?: NodeJS.WritableStream;
  isTty?: boolean;
};

const defaultDeps: MigrateDevDeps = { now: () => new Date() };

const resolveIo = (deps: MigrateDevDeps): DataLossIo => ({
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
  deps: MigrateDevDeps,
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

const keepRecordedDecision = (
  prepared: PreparedMigrationStub,
  recorded: string | undefined,
  decided: boolean,
): boolean => {
  if (recorded === undefined) return decided;
  if (recorded === prepared.render(true)) return true;
  if (recorded === prepared.render(false)) return false;
  return decided;
};

async function migrateDev(
  options?: MigrateDevOptions,
  deps: MigrateDevDeps = defaultDeps,
): Promise<void> {
  const prepared = prepareMigrationStub(options);
  const migrationsDir = path.join(prepared.baseDir, "migrations");
  const recorded = findLatestMigrationContent(migrationsDir);
  const outcome = await decideDataLoss(
    { recorded, models: prepared.models },
    resolveIo(deps),
  );

  if (!outcome.proceed) {
    if (outcome.reason === "no-terminal")
      throw new MigrateConfirmationRequiredError();
    console.log(
      `Aborted. ${STUB_FILE_NAME} and the migration were not written.`,
    );
    return;
  }

  const acceptDataLoss = keepRecordedDecision(
    prepared,
    recorded,
    outcome.acceptDataLoss,
  );
  const content = prepared.render(acceptDataLoss);
  const stubPath = writeMigrationStub(prepared.outputDir, content);
  const written = recordMigration(migrationsDir, content, options?.name, deps);
  printNextSteps(stubPath, buildHeadline(written), acceptDataLoss);
}

export { migrateDev };
export type { MigrateDevDeps, MigrateDevOptions };
