import path from "path";
import { resolveSchemaFiles } from "../config/resolveSchemaFiles";
import { NoMigrationTrailError } from "../error/mainError";
import { findBaseDir } from "../generate/generate";
import { writeMigrationStub } from "./generateMigrationStub";
import { findLatestMigration } from "./migrationTrail";
import { printNextSteps } from "./printNextSteps";
import { readTrailDefinition } from "./readTrailDefinition";
import { resolveOutputDir } from "./resolveOutputDir";

type MigrateDeployOptions = {
  output?: string;
  config?: string;
};

const resolveMigrationsDir = (config: string | undefined): string => {
  const files = resolveSchemaFiles({ config });
  return path.join(
    findBaseDir(files.map((file) => file.filePath)),
    "migrations",
  );
};

function migrateDeploy(options?: MigrateDeployOptions): void {
  const migrationsDir = resolveMigrationsDir(options?.config);
  const latest = findLatestMigration(migrationsDir);
  if (latest === undefined) throw new NoMigrationTrailError(migrationsDir);

  console.log(`📄 Using ${latest.migrationPath}`);
  const outputDir = resolveOutputDir(options?.output, process.cwd());
  const stubPath = writeMigrationStub(outputDir, latest.content);
  const recorded = readTrailDefinition(latest.content);
  printNextSteps(
    stubPath,
    "✅ Latest recorded migration prepared",
    recorded?.acceptDataLoss === true,
  );
}

export { migrateDeploy };
export type { MigrateDeployOptions };
