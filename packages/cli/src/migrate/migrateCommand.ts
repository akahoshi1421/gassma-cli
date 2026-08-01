import fs from "fs";
import path from "path";
import { extractSpreadsheetId } from "../config/extractSpreadsheetId";
import { filterOutputFiles } from "../config/filterOutputFiles";
import { loadConfig } from "../config/loadConfig";
import { logLoadedConfig } from "../config/logLoadedConfig";
import { resolveSchemaFiles } from "../config/resolveSchemaFiles";
import { NoModelsError } from "../error/mainError";
import { findBaseDir } from "../generate/generate";
import { mergeSchemaFiles } from "../generate/mergeSchemaFiles";
import { extractDatasourceUrl } from "../generate/read/extractDatasourceUrl";
import { readTemplate } from "../util/readTemplate";
import { buildMigrateModels } from "./buildMigrateModels";
import { buildMigrationDirName } from "./migrationDirName";
import {
  findLatestMigrationContent,
  writeMigrationTrail,
} from "./migrationTrail";
import { patchMigrationScript } from "./patchMigrationScript";
import type { MigrateSheetsDefinition } from "./patchMigrationScript";
import { resolveOutputDir } from "./resolveOutputDir";
import { resolveUserSymbol } from "./resolveUserSymbol";

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

const STUB_FILE_NAME = "gassma-migration.js";

const resolveSpreadsheetId = (
  schemaText: string,
  configUrl: string | undefined,
): string | undefined => {
  const fromConfig = extractSpreadsheetId(configUrl);
  const fromSchema = extractDatasourceUrl(schemaText);
  const resolved = extractSpreadsheetId(fromSchema ?? fromConfig);
  return resolved === undefined || resolved === "" ? undefined : resolved;
};

const buildDefinition = (
  schemaText: string,
  configUrl: string | undefined,
  schemaLocation: string,
  acceptDataLoss: boolean,
): MigrateSheetsDefinition => {
  const models = buildMigrateModels(schemaText);
  if (models.length === 0) throw new NoModelsError(schemaLocation);

  const spreadsheetId = resolveSpreadsheetId(schemaText, configUrl);
  return {
    ...(spreadsheetId === undefined ? {} : { spreadsheetId }),
    ...(acceptDataLoss ? { acceptDataLoss: true } : {}),
    models,
  };
};

const writeMigrationStub = (outputDir: string, content: string): string => {
  fs.mkdirSync(outputDir, { recursive: true });
  const stubPath = path.join(outputDir, STUB_FILE_NAME);
  fs.writeFileSync(stubPath, content, "utf-8");
  console.log(`📄 Wrote ${stubPath}`);
  return stubPath;
};

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

const printNextSteps = (
  stubPath: string,
  recorded: boolean,
  acceptDataLoss: boolean,
): void => {
  const headline = recorded
    ? "✅ Migration generated"
    : `✅ Refreshed ${STUB_FILE_NAME} (no new migration recorded)`;
  console.log(`\n${headline}\n`);
  if (acceptDataLoss)
    console.log(
      "⚠️ This migration deletes sheets and columns that are not in the schema.\n",
    );
  console.log("Next steps:");
  console.log(`  1. Run "clasp push" (or "npm run push") to upload ${STUB_FILE_NAME}
  2. In the Apps Script editor, run the "gassmaMigrate" function once`);
  console.log(
    '\nNote: push with "clasp push" directly. A full clean build (e.g. "npm run deploy")' +
      ` may wipe the output directory and delete ${stubPath} before it is pushed.`,
  );
};

function migrate(options?: MigrateOptions, deps: MigrateDeps = defaultDeps) {
  const allFiles = resolveSchemaFiles({
    schema: options?.schema,
    config: options?.config,
  });
  const baseDir = findBaseDir(allFiles.map((f) => f.filePath));
  const files = filterOutputFiles(allFiles, baseDir);
  const loaded = loadConfig(options?.config);
  logLoadedConfig(loaded?.filePath);

  const schemaText = mergeSchemaFiles(files.map((f) => f.filePath));
  const schemaLocation = path.resolve(
    files.length === 1 ? files[0].filePath : baseDir,
  );
  const acceptDataLoss = options?.acceptDataLoss === true;
  const definition = buildDefinition(
    schemaText,
    loaded?.config.datasource?.url,
    schemaLocation,
    acceptDataLoss,
  );

  const outputDir = resolveOutputDir(options?.output, process.cwd());
  const userSymbol = resolveUserSymbol(outputDir);
  const content = patchMigrationScript(
    readTemplate("gassma-migration.js.template"),
    { userSymbol, definition },
  );

  const stubPath = writeMigrationStub(outputDir, content);
  const recorded = recordMigration(baseDir, content, options?.name, deps);
  printNextSteps(stubPath, recorded, acceptDataLoss);
}

export { migrate };
export type { MigrateDeps, MigrateOptions };
