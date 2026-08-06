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
import type { MigrateModelDefinition } from "./buildMigrateModels";
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

type PreparedMigrationStub = {
  outputDir: string;
  baseDir: string;
  models: MigrateModelDefinition[];
  render: (acceptDataLoss: boolean) => string;
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
  models: MigrateModelDefinition[],
  spreadsheetId: string | undefined,
  acceptDataLoss: boolean,
): MigrateSheetsDefinition => ({
  ...(spreadsheetId === undefined ? {} : { spreadsheetId }),
  ...(acceptDataLoss ? { acceptDataLoss: true } : {}),
  models,
});

const writeMigrationStub = (outputDir: string, content: string): string => {
  fs.mkdirSync(outputDir, { recursive: true });
  const stubPath = path.join(outputDir, STUB_FILE_NAME);
  fs.writeFileSync(stubPath, content, "utf-8");
  console.log(`📄 Wrote ${stubPath}`);
  return stubPath;
};

const prepareMigrationStub = (
  options?: MigrationStubOptions,
): PreparedMigrationStub => {
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
  const models = buildMigrateModels(schemaText);
  if (models.length === 0) throw new NoModelsError(schemaLocation);
  const spreadsheetId = resolveSpreadsheetId(
    schemaText,
    loaded?.config.datasource?.url,
  );

  const outputDir = resolveOutputDir(options?.output, process.cwd());
  const userSymbol = resolveUserSymbol(outputDir);
  const template = readTemplate("gassma-migration.js.template");

  return {
    outputDir,
    baseDir,
    models,
    render: (acceptDataLoss) =>
      patchMigrationScript(template, {
        userSymbol,
        definition: buildDefinition(models, spreadsheetId, acceptDataLoss),
      }),
  };
};

const generateMigrationStub = (
  options?: MigrationStubOptions,
): MigrationStubResult => {
  const prepared = prepareMigrationStub(options);
  const acceptDataLoss = options?.acceptDataLoss === true;
  const content = prepared.render(acceptDataLoss);
  return {
    stubPath: writeMigrationStub(prepared.outputDir, content),
    content,
    baseDir: prepared.baseDir,
    acceptDataLoss,
  };
};

export {
  STUB_FILE_NAME,
  generateMigrationStub,
  prepareMigrationStub,
  writeMigrationStub,
};
export type {
  MigrationStubOptions,
  MigrationStubResult,
  PreparedMigrationStub,
};
