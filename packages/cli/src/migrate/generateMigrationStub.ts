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
import { patchMigrationScript } from "./patchMigrationScript";
import type { MigrateSheetsDefinition } from "./patchMigrationScript";
import { resolveOutputDir } from "./resolveOutputDir";
import { resolveUserSymbol } from "./resolveUserSymbol";

const STUB_FILE_NAME = "gassma-migration.js";

type MigrationStubOptions = {
  output?: string;
  schema?: string;
  config?: string;
  acceptDataLoss?: boolean;
};

type MigrationStubResult = {
  stubPath: string;
  content: string;
  baseDir: string;
  acceptDataLoss: boolean;
};

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

const generateMigrationStub = (
  options?: MigrationStubOptions,
): MigrationStubResult => {
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
  return { stubPath, content, baseDir, acceptDataLoss };
};

export { STUB_FILE_NAME, generateMigrationStub };
export type { MigrationStubOptions, MigrationStubResult };
